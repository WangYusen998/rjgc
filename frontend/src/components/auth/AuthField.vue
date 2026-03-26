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
  height: 44px;
  border: 1px solid #d2dbea;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: center;
  background: #fff;
}

.input-wrap.is-error {
  border-color: #d93025;
}

.icon {
  text-align: center;
  color: #0b63d6;
  font-weight: 700;
}

.input-wrap :deep(.ds-input) {
  border: 0;
  padding: 0;
  font-size: 16px;
}

.field-error {
  margin: 0;
  color: #d93025;
  font-size: 12px;
}
</style>

