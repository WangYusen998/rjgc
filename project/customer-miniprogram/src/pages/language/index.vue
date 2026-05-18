<template>
  <view class="page language-page">
    <view class="hero-card hero">
      <text class="brand">SwiftRide</text>
      <text class="title">{{ selectedCopy.chooseLanguage }}</text>
      <text class="copy">{{ selectedCopy.languageHint }}</text>
    </view>

    <view class="language-list">
      <view
        v-for="item in languageOptions"
        :key="item.code"
        :class="['card', 'language-card', selected === item.code ? 'active' : '']"
        @tap="selected = item.code"
      >
        <view>
          <text class="language-name">{{ item.name }}</text>
          <text class="muted">{{ item.subtitle }}</text>
        </view>
        <text class="check">{{ selected === item.code ? '✓' : '' }}</text>
      </view>
    </view>

    <button class="primary-btn" @tap="enter">{{ selectedCopy.continue }}</button>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { copy, languageOptions, setLang } from '../../data/i18n'

const selected = ref('zh')
const selectedCopy = computed(() => copy[selected.value])

function enter() {
  setLang(selected.value)
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style scoped>
.language-page {
  gap: 24rpx;
}

.hero {
  padding: 42rpx;
  background: #101114;
  color: #fff;
}

.brand,
.title,
.copy,
.language-name {
  display: block;
}

.brand {
  color: #86efac;
  font-size: 26rpx;
  font-weight: 900;
}

.title {
  margin-top: 16rpx;
  font-size: 54rpx;
  font-weight: 900;
}

.copy {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 27rpx;
  line-height: 1.5;
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.language-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 30rpx;
  border: 3rpx solid transparent;
}

.language-card.active {
  border-color: #0f766e;
}

.language-name {
  color: #111827;
  font-size: 34rpx;
  font-weight: 900;
}

.check {
  color: #0f766e;
  font-size: 44rpx;
  font-weight: 900;
}
</style>
