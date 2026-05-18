<script>
import { applyTabBarLanguage, getLang } from './data/i18n'

export default {
  onLaunch() {
    console.log('SwiftRide customer mini program launched')
    if (getLang()) applyTabBarLanguage()
  },
}
</script>

<style>
page {
  min-height: 100%;
  background: #eef3f7;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button {
  margin: 0;
  border-radius: 0;
}

button::after {
  border: none;
}

.page {
  min-height: 100vh;
  padding: 28rpx 28rpx 44rpx;
  background:
    radial-gradient(circle at 20% 0%, rgba(30, 185, 128, 0.18), transparent 36%),
    linear-gradient(180deg, #f7fbff 0%, #eef3f7 46%, #f6f8fb 100%);
}

.hero-card,
.card {
  overflow: hidden;
  border: 1rpx solid rgba(148, 163, 184, 0.22);
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 20rpx 54rpx rgba(15, 23, 42, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 38rpx 0 18rpx;
  color: #111827;
  font-size: 34rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.muted {
  color: #64748b;
}

.subtle {
  color: #94a3b8;
}

.primary-btn {
  display: flex;
  min-height: 92rpx;
  align-items: center;
  justify-content: center;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #111827 0%, #0f766e 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  box-shadow: 0 16rpx 34rpx rgba(15, 118, 110, 0.24);
}

.ghost-btn {
  display: flex;
  min-height: 84rpx;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #dbe5ef;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-size: 28rpx;
  font-weight: 900;
}

.danger-btn {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b42318;
}

.input {
  width: 100%;
  min-height: 96rpx;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border: 2rpx solid #dbe5ef;
  border-radius: 24rpx;
  background: #ffffff;
  color: #111827;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  min-height: 180rpx;
  margin-top: 18rpx;
  padding: 24rpx;
  border: 2rpx solid #dbe5ef;
  border-radius: 24rpx;
  background: #ffffff;
  color: #111827;
  font-size: 28rpx;
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  padding: 9rpx 18rpx;
  background: #dcfce7;
  color: #027a48;
  font-size: 22rpx;
  font-weight: 900;
}

.pill.warn {
  background: #fff7ed;
  color: #c2410c;
}

.pill.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.metric {
  display: grid;
  gap: 8rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.94);
  padding: 22rpx 18rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.06);
}

.metric-value {
  color: #111827;
  font-size: 36rpx;
  font-weight: 900;
}

.metric-label {
  color: #64748b;
  font-size: 21rpx;
  font-weight: 700;
}

.empty-state {
  display: grid;
  gap: 16rpx;
  padding: 34rpx;
  text-align: center;
}

.empty-title {
  color: #111827;
  font-size: 32rpx;
  font-weight: 900;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
