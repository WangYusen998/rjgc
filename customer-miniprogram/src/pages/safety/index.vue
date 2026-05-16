<template>
  <view class="page safety-page">
    <view class="hero-card head">
      <text class="kicker">{{ isEn ? 'Safety & Liability' : '安全责任' }}</text>
      <text class="title">{{ isEn ? 'Insurance, exemptions, and return responsibility.' : '保险、免责和还车责任。' }}</text>
      <text class="copy">{{ isEn ? 'Covers shared scooter rental and store rental responsibility terms.' : '用于中期反馈中“安全责任”部分展示，覆盖共享租车与门店租还两种商业模式。' }}</text>
    </view>

    <view class="metric-grid">
      <view class="metric">
        <text class="metric-value">{{ isEn ? 'CNY 2' : '2 元' }}</text>
        <text class="metric-label">{{ isEn ? 'Ride insurance' : '骑行保险' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">GPS</text>
        <text class="metric-label">{{ isEn ? 'Accident tracing' : '事故追溯' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">{{ isEn ? 'Card' : '银行卡' }}</text>
        <text class="metric-label">{{ isEn ? 'Liability charges' : '责任扣费' }}</text>
      </view>
    </view>

    <view class="card clause-card">
      <view v-for="(item, index) in clauses" :key="item" class="clause-row">
        <text class="number">{{ index + 1 }}</text>
        <text class="clause-text">{{ item }}</text>
      </view>
    </view>

    <view class="card note-card">
      <text class="note-title">{{ isEn ? 'Demo statement' : '演示声明' }}</text>
      <text class="muted">{{ isEn ? 'This mini program uses local simulated data. It does not charge real money or connect to real scooters. A production launch requires scooter communication modules, backend services, payment/card compliance, insurance terms, and privacy compliance.' : '当前小程序使用本地模拟数据，不实际收费、不接入真实车辆。真实上线时需要车辆通信模块、后台服务、支付/信用卡合规、保险条款和隐私合规。' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getSafetyClauses } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const isEn = computed(() => getLang() === 'en')
const clauses = computed(() => getSafetyClauses())

onShow(() => setNavTitle('安全责任', 'Safety & Liability'))
</script>

<style scoped>
.safety-page {
  gap: 24rpx;
}

.head {
  padding: 36rpx;
  background: #101114;
  color: #fff;
}

.kicker,
.title,
.copy,
.note-title {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 24rpx;
  font-weight: 900;
}

.title {
  margin-top: 14rpx;
  font-size: 48rpx;
  font-weight: 900;
}

.copy {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 26rpx;
  line-height: 1.5;
}

.clause-card,
.note-card {
  padding: 30rpx;
}

.clause-row {
  display: flex;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.clause-row:last-child {
  border-bottom: none;
}

.number {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #dcfce7;
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 900;
}

.clause-text {
  flex: 1;
  color: #334155;
  font-size: 27rpx;
  line-height: 1.55;
}

.note-title {
  margin-bottom: 12rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}
</style>
