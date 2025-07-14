# 🚨 CRITICAL RTL RULES FOR HEBREW IN REACT NATIVE

## ✅ CONFIRMED RULES (iOS with I18nManager.isRTL = TRUE)

When `I18nManager.isRTL = TRUE` and `doLeftAndRightSwapInRTL = TRUE`:

### Text Alignment
- **USE `textAlign: 'left'`** → Hebrew appears on visual RIGHT side ✅
- **AVOID `textAlign: 'right'`** → Hebrew appears on visual LEFT side ❌
- **USE `textAlign: 'center'`** → For centered content (OK) ✅

### Container Alignment
- **USE `alignItems: 'flex-start'`** → Content appears on visual RIGHT side ✅
- **AVOID `alignItems: 'flex-end'`** → Content appears on visual LEFT side ❌
- **USE `alignSelf: 'flex-start'`** → Element appears on visual RIGHT side ✅

### What NOT to use
- **AVOID `writingDirection: 'rtl'`** → Doesn't help, can cause issues
- **AVOID `textAlign: 'right'`** → Shows on wrong side in RTL mode

## 📝 SUMMARY FOR ALL HEBREW TEXT

```javascript
// For Hebrew text alignment (right-aligned):
const rtlTextStyle = {
  textAlign: 'left',  // In RTL mode, this shows on visual RIGHT
};

// For Hebrew containers (right-aligned):
const rtlContainerStyle = {
  alignItems: 'flex-start',  // In RTL mode, this aligns to visual RIGHT
};
```

## ⚠️ IMPORTANT
These rules apply when the app has `I18nManager.forceRTL(true)` enabled.
Without RTL mode, the rules would be opposite!