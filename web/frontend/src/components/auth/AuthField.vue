<script setup>
const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '@' },
  autocomplete: { type: String, default: 'off' },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field ds-field">
    <label class="ds-label" :for="props.id">{{ props.label }}</label>
    <div class="input-wrap" :class="{ 'is-error': props.error }">
      <span class="icon" aria-hidden="true">{{ props.icon }}</span>
      <input
        :id="props.id"
        class="ds-input"
        :type="props.type"
        :value="props.modelValue"
        :placeholder="props.placeholder"
        :autocomplete="props.autocomplete"
        :aria-invalid="Boolean(props.error)"
        :aria-describedby="props.error ? `${props.id}-error` : undefined"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="props.error" :id="`${props.id}-error`" class="field-error" role="alert">{{ props.error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 6px;
}

.input-wrap {
  min-height: 48px;
  border: 1px solid #d2dbea;
  border-radius: 14px;
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(247 250 255 / 94%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 88%);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.input-wrap.is-error {
  border-color: #d93025;
}

.input-wrap:focus-within {
  border-color: #5a9df0;
  box-shadow: 0 0 0 4px rgb(22 114 216 / 10%);
  background: #fff;
}

.icon {
  text-align: center;
  color: #0b63d6;
  font-weight: 700;
}

.input-wrap :deep(.ds-input) {
  border: 0;
  min-height: 48px;
  height: 100%;
  padding: 0 14px 0 8px;
  font-size: 16px;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.field-error {
  margin: 0;
  color: #d93025;
  font-size: 12px;
}
</style>
