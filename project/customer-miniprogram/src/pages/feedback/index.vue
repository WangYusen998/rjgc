<template>
  <view class="page">
    <view class="card head">
      <text class="title">{{ isEn ? 'Issue Report' : '问题反馈' }}</text>
      <text class="muted">{{ isEn ? 'Report scooter faults, return-zone issues, payment issues, or service suggestions. Admins can process them in the backend.' : '用于提交车辆故障、还车点问题、支付问题和服务建议，管理员后台可直接处理。' }}</text>
    </view>

    <view class="card form">
      <text class="label">{{ isEn ? 'Scooter ID' : '车辆编号' }}</text>
      <input class="input" v-model="form.scooterId" :placeholder="isEn ? 'e.g. SC101' : '例如 SC101'" />
      <text class="label">{{ isEn ? 'Issue type' : '问题类型' }}</text>
      <picker :range="types" @change="selectType">
        <view class="input picker">{{ form.type }}</view>
      </picker>
      <text class="label">{{ isEn ? 'Priority' : '优先级' }}</text>
      <picker :range="priorities" @change="selectPriority">
        <view class="input picker">{{ form.priority }}</view>
      </picker>
      <text class="label">{{ isEn ? 'Description' : '问题描述' }}</text>
      <textarea class="textarea" v-model="form.message" :placeholder="isEn ? 'Describe the location, symptom, or suggestion' : '请描述问题位置、现象或建议'" />
      <button class="primary-btn submit" @tap="submit">{{ isEn ? 'Submit Report' : '提交反馈' }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { createIssue, getCurrentUser } from '../../data/mock'
import { createRemoteIssue } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const isEn = computed(() => getLang() === 'en')
const zhTypes = ['车辆损坏', '低电量', '还车点问题', '支付问题', '其他']
const enTypes = ['Vehicle damage', 'Low battery', 'Return-zone issue', 'Payment issue', 'Other']
const zhPriorities = ['中', '高', '低']
const enPriorities = ['Medium', 'High', 'Low']
const types = computed(() => (isEn.value ? enTypes : zhTypes))
const priorities = computed(() => (isEn.value ? enPriorities : zhPriorities))
const form = reactive({
  scooterId: '',
  type: zhTypes[0],
  priority: zhPriorities[0],
  message: '',
})

onShow(() => setNavTitle('问题反馈', 'Issue Report'))

watch(isEn, () => {
  form.type = types.value[0]
  form.priority = priorities.value[0]
}, { immediate: true })

function selectType(event) {
  form.type = types.value[Number(event.detail.value)]
}

function selectPriority(event) {
  form.priority = priorities.value[Number(event.detail.value)]
}

async function submit() {
  if (!form.message.trim()) {
    uni.showToast({ title: isEn.value ? 'Please enter a description' : '请填写描述', icon: 'none' })
    return
  }
  try {
    await createRemoteIssue({ ...form, account: getCurrentUser()?.account || 'student001' })
  } catch {
    createIssue(form)
  }
  uni.showModal({
    title: isEn.value ? 'Submitted' : '提交成功',
    content: isEn.value ? 'The report has been saved. Admins can review and process it in Issue Management.' : '反馈已保存，管理员可在“问题反馈管理”板块查看并处理。',
    showCancel: false,
  })
  form.scooterId = ''
  form.message = ''
  form.priority = priorities.value[0]
}
</script>

<style scoped>
.head,
.form {
  padding: 28rpx;
}

.title {
  display: block;
  color: #111827;
  font-size: 44rpx;
  font-weight: 900;
}

.label {
  display: block;
  margin-top: 22rpx;
  color: #334155;
  font-size: 25rpx;
  font-weight: 900;
}

.picker {
  display: flex;
  align-items: center;
  color: #111827;
}

.submit {
  margin-top: 28rpx;
}
</style>
