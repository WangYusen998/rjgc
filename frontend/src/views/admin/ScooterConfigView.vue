<script setup>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const form = reactive({ id: '', location: '', hourlyCost: 4, imageUrl: '' })

function addScooter() {
  if (!form.id || !form.location) {
    ElMessage.error('Please input scooter ID and location.')
    return
  }
  if (booking.scooters.some((item) => item.id === form.id)) {
    ElMessage.error('Scooter ID already exists.')
    return
  }
  booking.addScooter(form)
  form.id = ''
  form.location = ''
  form.hourlyCost = 4
  form.imageUrl = ''
  ElMessage.success('Scooter added.')
}

async function removeScooter(id) {
  try {
    await ElMessageBox.confirm(`Delete scooter ${id}?`, 'Confirm', { type: 'warning' })
    booking.removeScooter(id)
    ElMessage.success('Scooter removed.')
  } catch {
    // cancelled
  }
}

function updateImageByFile(event, scooterId) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    booking.setScooterImage(scooterId, String(reader.result || ''))
    ElMessage.success('Image updated.')
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <h1>Scooter Configuration</h1>
      <p>Manage fleet inventory, status and hourly prices.</p>
    </header>

    <article class="panel">
      <h2>[ADD] Add Scooter</h2>
      <div class="form-grid">
        <input v-model="form.id" placeholder="ID (e.g. SC-110)" />
        <input v-model="form.location" placeholder="Location" />
        <input v-model.number="form.hourlyCost" type="number" min="1" placeholder="Hourly cost" />
        <input v-model="form.imageUrl" placeholder="Image URL (optional)" />
        <button class="btn-primary" @click="addScooter">Add</button>
      </div>
    </article>

    <article class="panel">
      <h2>[FLEET] Fleet Table</h2>
      <div v-if="booking.scooters.length > 0" class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Image</th><th>Location</th><th>Available</th><th>Hourly Cost</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in booking.scooters" :key="item.id">
              <td>{{ item.id }}</td>
              <td>
                <div class="image-cell">
                  <img :src="item.imageUrl || '/scooter-placeholder.svg'" alt="Scooter" />
                  <input class="img-url-input" type="text" :value="item.imageUrl || ''" placeholder="Image URL" @change="booking.setScooterImage(item.id, $event.target.value)" />
                  <input class="img-file-input" type="file" accept="image/*" @change="updateImageByFile($event, item.id)" />
                </div>
              </td>
              <td>{{ item.location }}</td>
              <td><input type="checkbox" :checked="item.available" @change="booking.setScooterAvailability(item.id, $event.target.checked)" /></td>
              <td><input type="number" :value="item.hourlyCost" min="1" @change="booking.setHourlyCost(item.id, Number($event.target.value))" /></td>
              <td><button class="btn-danger" @click="removeScooter(item.id)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-box">
        <h3>No records yet</h3>
        <p>Add scooters to initialize fleet data.</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head, .panel { border: 1px solid rgba(146,170,214,.3); border-radius: 12px; background: rgba(13,28,51,.72); padding: 14px; }
h1, h2 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.form-grid { margin-top: 10px; display: grid; gap: 8px; grid-template-columns: repeat(5, minmax(0,1fr)); }
input { border: 1px solid rgba(146,170,214,.4); border-radius: 8px; background: rgba(255,255,255,.95); padding: 8px 10px; }
.btn-primary,.btn-danger { border: 0; border-radius: 8px; padding: 9px 10px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #0b63d6; color: #fff; }
.btn-danger { background: #ef4444; color: #fff; }
.table-wrap { overflow: auto; margin-top: 10px; }
.table { width: 100%; border-collapse: collapse; min-width: 780px; }
.table th,.table td { border: 1px solid rgba(146,170,214,.3); padding: 8px; text-align: left; }
.table input[type="number"] { width: 100px; }
.image-cell { display: grid; gap: 6px; min-width: 180px; }
.image-cell img { width: 120px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(146,170,214,.3); background: #fff; }
.img-url-input, .img-file-input { width: 100%; }
.empty-box { margin-top: 10px; border: 1px dashed rgba(146,170,214,.45); border-radius: 10px; padding: 20px; text-align: center; color: #b9cbe3; }
.empty-box h3 { margin: 0; color: #e5eefb; }
.empty-box p { margin: 8px 0 0; }
@media (max-width: 980px) { .form-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 680px) { .form-grid { grid-template-columns: 1fr; } }
</style>
