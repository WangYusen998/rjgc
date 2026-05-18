<template>
  <view class="page ops-page">
    <view class="card head">
      <text class="title">{{ isEn ? 'Backend Operations Demo' : '后台运营演示' }}</text>
      <text class="muted">{{ isEn ? 'Simulates the backend receiving GPS, battery, mileage, and fault reports from scooter communication modules.' : '模拟平台后台接收车辆通信模块上报的 GPS、电量、里程和故障状态。' }}</text>
    </view>

    <view class="metric-grid">
      <view class="metric">
        <text class="metric-value">{{ snapshot.telemetry.length }}</text>
        <text class="metric-label">{{ isEn ? 'Online scooters' : '在线车辆' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">{{ snapshot.chargingQueue.length }}</text>
        <text class="metric-label">{{ isEn ? 'Need charging' : '待充电' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">{{ snapshot.faults.length }}</text>
        <text class="metric-label">{{ isEn ? 'Open faults' : '故障待处理' }}</text>
      </view>
    </view>

    <view class="section-title"><text>{{ isEn ? 'Live Telemetry' : '实时监测' }}</text></view>
    <view class="card table-card">
      <view v-for="item in snapshot.telemetry" :key="item.id" class="table-row">
        <view>
          <text class="row-title">{{ item.id }}</text>
          <text class="muted">GPS {{ item.location }} · {{ item.lastTelemetryAt }}</text>
        </view>
        <text class="status">{{ item.battery }}% · {{ item.mileage }}km</text>
      </view>
    </view>

    <view class="section-title"><text>{{ isEn ? 'Charging & Dispatch' : '充电与调度' }}</text></view>
    <view class="card table-card">
      <view v-for="item in snapshot.chargingQueue" :key="item.scooterId" class="table-row">
        <view>
          <text class="row-title">{{ item.scooterId }} · {{ isEn ? 'Priority' : '优先级' }} {{ item.priority }}</text>
          <text class="muted">{{ isEn ? 'Collect to charge at' : '回收到' }} {{ item.targetStore }} {{ isEn ? '' : '充电' }}</text>
        </view>
        <text class="status warn">{{ item.battery }}%</text>
      </view>
    </view>

    <view class="section-title"><text>{{ isEn ? 'Deployment / Collection Staff' : '部署/收集人员' }}</text></view>
    <view class="card table-card">
      <view v-for="item in snapshot.deployments" :key="item.staff" class="table-row">
        <view>
          <text class="row-title">{{ item.staff }}</text>
          <text class="muted">{{ item.task }}</text>
        </view>
        <text class="status">{{ item.status }}</text>
      </view>
    </view>

    <view class="section-title"><text>{{ isEn ? 'Fault Scooter Management' : '故障车管理' }}</text></view>
    <view class="card table-card">
      <view v-for="item in snapshot.faults" :key="item.scooterId" class="table-row">
        <view>
          <text class="row-title">{{ item.scooterId }}</text>
          <text class="muted">{{ item.issue }}</text>
        </view>
        <text class="status danger">{{ item.status }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { operationsSnapshot } from '../../data/mock'
import { getLang } from '../../data/i18n'
import { computed } from 'vue'

const snapshot = operationsSnapshot()
const isEn = computed(() => getLang() === 'en')
</script>

<style scoped>
.ops-page {
  gap: 22rpx;
}

.head,
.table-card {
  padding: 28rpx;
}

.title {
  display: block;
  color: #111827;
  font-size: 44rpx;
  font-weight: 900;
}

.table-row {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.table-row:last-child {
  border-bottom: none;
}

.row-title {
  display: block;
  color: #111827;
  font-size: 29rpx;
  font-weight: 900;
}

.status {
  flex: 0 0 auto;
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 900;
}

.status.warn {
  color: #c2410c;
}

.status.danger {
  color: #be123c;
}
</style>
