import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: string;
}

export interface TouchSession {
  id: string;
  startPoint: TouchPoint;
  currentPoint: TouchPoint;
  isActive: boolean;
  interactionType: 'unknown' | 'swipe' | 'tap' | 'button_press' | 'long_press';
  targetElement?: string;
  confidence: number; // 0-1 confidence in interaction type classification
}

export interface InteractionZone {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'button' | 'card' | 'swipe_area' | 'background';
  priority: number; // Higher numbers take precedence
  onInteraction?: (session: TouchSession) => void;
  blockSwipe?: boolean; // Whether this zone should prevent swipe gestures
}

interface TouchDelegationContextValue {
  registerZone: (zone: InteractionZone) => () => void;
  updateZone: (zoneId: string, updates: Partial<InteractionZone>) => void;
  getCurrentSession: () => TouchSession | null;
  isSwipeEnabled: () => boolean;
}

const TouchDelegationContext = createContext<TouchDelegationContextValue | null>(null);

export const useTouchDelegation = () => {
  const context = useContext(TouchDelegationContext);
  if (!context) {
    throw new Error('useTouchDelegation must be used within TouchDelegationManager');
  }
  return context;
};

interface TouchDelegationManagerProps {
  children: React.ReactNode;
  onSwipeGesture?: (direction: 'left' | 'right', velocity: number, session: TouchSession) => void;
  onCardTap?: (session: TouchSession) => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  enableHaptics?: boolean;
  debugMode?: boolean;
}

export const TouchDelegationManager: React.FC<TouchDelegationManagerProps> = ({
  children,
  onSwipeGesture,
  onCardTap,
  swipeThreshold = 80,
  velocityThreshold = 500,
  enableHaptics = true,
  debugMode = false,
}) => {
  // Registered interaction zones
  const [interactionZones, setInteractionZones] = useState<Map<string, InteractionZone>>(new Map());
  const zonesRef = useRef<Map<string, InteractionZone>>(new Map());
  
  // Current touch session
  const [currentSession, setCurrentSession] = useState<TouchSession | null>(null);
  const sessionRef = useRef<TouchSession | null>(null);
  
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const interactionScale = useSharedValue(1);
  
  // Touch classification algorithm
  const classifyInteraction = useCallback((session: TouchSession): {
    type: TouchSession['interactionType'];
    confidence: number;
  } => {
    const { startPoint, currentPoint } = session;
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = currentPoint.timestamp - startPoint.timestamp;
    const velocity = distance / Math.max(duration, 1);
    
    // Check if touch point is within any button zones
    const touchedZones = Array.from(zonesRef.current.values()).filter(zone => {
      const { bounds } = zone;
      return (
        currentPoint.x >= bounds.x &&
        currentPoint.x <= bounds.x + bounds.width &&
        currentPoint.y >= bounds.y &&
        currentPoint.y <= bounds.y + bounds.height
      );
    });
    
    // Sort by priority (highest first)
    touchedZones.sort((a, b) => b.priority - a.priority);
    const primaryZone = touchedZones[0];
    
    // Classification logic
    if (distance < 10 && duration < 300) {
      // Quick tap
      if (primaryZone?.type === 'button') {
        return { type: 'button_press', confidence: 0.95 };
      }
      return { type: 'tap', confidence: 0.9 };
    }
    
    if (duration > 500 && distance < 20) {
      // Long press
      return { type: 'long_press', confidence: 0.85 };
    }
    
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > swipeThreshold) {
      // Horizontal swipe
      if (primaryZone?.blockSwipe) {
        return { type: 'tap', confidence: 0.7 };
      }
      return { type: 'swipe', confidence: 0.8 + Math.min(velocity / 1000, 0.2) };
    }
    
    return { type: 'unknown', confidence: 0.1 };
  }, [swipeThreshold, zonesRef]);
  
  // Zone management functions
  const registerZone = useCallback((zone: InteractionZone): (() => void) => {
    const newZones = new Map(zonesRef.current);
    newZones.set(zone.id, zone);
    zonesRef.current = newZones;
    setInteractionZones(newZones);
    
    // Return cleanup function
    return () => {
      const updatedZones = new Map(zonesRef.current);
      updatedZones.delete(zone.id);
      zonesRef.current = updatedZones;
      setInteractionZones(updatedZones);
    };
  }, []);
  
  const updateZone = useCallback((zoneId: string, updates: Partial<InteractionZone>) => {
    const currentZone = zonesRef.current.get(zoneId);
    if (currentZone) {
      const updatedZone = { ...currentZone, ...updates };
      const newZones = new Map(zonesRef.current);
      newZones.set(zoneId, updatedZone);
      zonesRef.current = newZones;
      setInteractionZones(newZones);
    }
  }, []);
  
  const getCurrentSession = useCallback(() => sessionRef.current, []);
  
  const isSwipeEnabled = useCallback(() => {
    const currentTouchPoint = sessionRef.current?.currentPoint;
    if (!currentTouchPoint) return true;
    
    // Check if current touch is in a swipe-blocking zone
    const blockingZones = Array.from(zonesRef.current.values()).filter(zone => {
      if (!zone.blockSwipe) return false;
      
      const { bounds } = zone;
      return (
        currentTouchPoint.x >= bounds.x &&
        currentTouchPoint.x <= bounds.x + bounds.width &&
        currentTouchPoint.y >= bounds.y &&
        currentTouchPoint.y <= bounds.y + bounds.height
      );
    });
    
    return blockingZones.length === 0;
  }, []);
  
  // Gesture handlers
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const newSession: TouchSession = {
        id: `session_${Date.now()}`,
        startPoint: {
          x: event.x,
          y: event.y,
          timestamp: Date.now(),
          identifier: 'pan_start',
        },
        currentPoint: {
          x: event.x,
          y: event.y,
          timestamp: Date.now(),
          identifier: 'pan_current',
        },
        isActive: true,
        interactionType: 'unknown',
        confidence: 0,
      };
      
      sessionRef.current = newSession;
      setCurrentSession(newSession);
      
      // Visual feedback
      overlayOpacity.value = withSpring(debugMode ? 0.1 : 0);
      interactionScale.value = withSpring(1.01);
    })
    .onUpdate((event) => {
      if (!sessionRef.current) return;
      
      const updatedSession: TouchSession = {
        ...sessionRef.current,
        currentPoint: {
          x: event.x,
          y: event.y,
          timestamp: Date.now(),
          identifier: 'pan_update',
        },
      };
      
      // Classify interaction in real-time
      const classification = classifyInteraction(updatedSession);
      updatedSession.interactionType = classification.type;
      updatedSession.confidence = classification.confidence;
      
      sessionRef.current = updatedSession;
      setCurrentSession(updatedSession);
      
      // Update visual feedback based on classification
      if (classification.type === 'swipe' && classification.confidence > 0.7) {
        overlayOpacity.value = withSpring(0.2);
      }
    })
    .onEnd((event) => {
      if (!sessionRef.current) return;
      
      const finalSession: TouchSession = {
        ...sessionRef.current,
        currentPoint: {
          x: event.x,
          y: event.y,
          timestamp: Date.now(),
          identifier: 'pan_end',
        },
        isActive: false,
      };
      
      // Final classification
      const classification = classifyInteraction(finalSession);
      finalSession.interactionType = classification.type;
      finalSession.confidence = classification.confidence;
      
      // Execute appropriate callback based on classification
      if (classification.confidence > 0.6) {
        switch (classification.type) {
          case 'swipe':
            if (onSwipeGesture && isSwipeEnabled()) {
              const deltaX = finalSession.currentPoint.x - finalSession.startPoint.x;
              const direction = deltaX > 0 ? 'right' : 'left';
              const velocity = Math.abs(event.velocityX || 0);
              onSwipeGesture(direction, velocity, finalSession);
            }
            break;
            
          case 'tap':
            if (onCardTap) {
              onCardTap(finalSession);
            }
            break;
            
          case 'button_press':
            // Handle button press - this will be delegated to the specific button
            const touchedZones = Array.from(zonesRef.current.values()).filter(zone => {
              const { bounds } = zone;
              const point = finalSession.currentPoint;
              return (
                point.x >= bounds.x &&
                point.x <= bounds.x + bounds.width &&
                point.y >= bounds.y &&
                point.y <= bounds.y + bounds.height
              );
            });
            
            touchedZones.sort((a, b) => b.priority - a.priority);
            if (touchedZones[0]?.onInteraction) {
              touchedZones[0].onInteraction(finalSession);
            }
            break;
        }
      }
      
      // Reset visual feedback
      overlayOpacity.value = withSpring(0);
      interactionScale.value = withSpring(1);
      
      // Clear session
      sessionRef.current = null;
      setCurrentSession(null);
    });
  
  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: interactionScale.value }],
  }));
  
  // Context value
  const contextValue: TouchDelegationContextValue = {
    registerZone,
    updateZone,
    getCurrentSession,
    isSwipeEnabled,
  };
  
  return (
    <TouchDelegationContext.Provider value={contextValue}>
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.gestureContainer, overlayStyle]}>
            {children}
            
            {/* Debug overlay */}
            {debugMode && currentSession && (
              <View style={styles.debugOverlay}>
                <View style={[
                  styles.debugTouchPoint,
                  {
                    left: currentSession.currentPoint.x - 10,
                    top: currentSession.currentPoint.y - 10,
                  }
                ]} />
                <View style={styles.debugInfo}>
                  <Animated.Text style={styles.debugText}>
                    Type: {currentSession.interactionType}
                  </Animated.Text>
                  <Animated.Text style={styles.debugText}>
                    Confidence: {(currentSession.confidence * 100).toFixed(0)}%
                  </Animated.Text>
                </View>
              </View>
            )}
            
            {/* Zone visualization in debug mode */}
            {debugMode && (
              <View style={styles.debugZones}>
                {Array.from(interactionZones.values()).map(zone => (
                  <View
                    key={zone.id}
                    style={[
                      styles.debugZone,
                      {
                        left: zone.bounds.x,
                        top: zone.bounds.y,
                        width: zone.bounds.width,
                        height: zone.bounds.height,
                        backgroundColor: zone.type === 'button' 
                          ? 'rgba(255, 0, 0, 0.2)' 
                          : 'rgba(0, 255, 0, 0.2)',
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </TouchDelegationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  debugOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  debugTouchPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: 'white',
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  debugZones: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  debugZone: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
});

export default TouchDelegationManager;