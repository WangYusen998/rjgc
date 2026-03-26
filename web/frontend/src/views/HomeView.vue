<script setup>
const workflow = [
  { step: '01', title: 'Find', desc: 'Check nearby scooter availability by location and status.' },
  { step: '02', title: 'Book', desc: 'Choose duration and confirm ride with simulated payment.' },
  { step: '03', title: 'Manage', desc: 'Track orders, extend or cancel, and send issue reports.' },
]

const featured = [
  { id: 'SC-101', area: 'City Centre', price: 'GBP 4/hour', status: 'Available', statusClass: 'ds-badge-success' },
  { id: 'SC-103', area: 'Station C', price: 'GBP 5/hour', status: 'In Use', statusClass: 'ds-badge-muted' },
  { id: 'SC-104', area: 'Station D', price: 'GBP 4/hour', status: 'Available', statusClass: 'ds-badge-success' },
]

const highlights = [
  { title: 'Easy Booking', desc: 'Streamlined flow from scooter list to payment confirmation.' },
  { title: 'Real-Time Map', desc: 'Location board with status indicators and quick actions.' },
  { title: 'Manager Support', desc: 'Admin tools for fleet updates, issues, and revenue overview.' },
  { title: 'Responsive UI', desc: 'Consistent experience on desktop and mobile layouts.' },
]
</script>

<template>
  <div class="landing">
    <section class="hero">
      <article class="hero-main">
        <h1>SwiftRide</h1>
        <div class="hero-actions">
          <RouterLink to="/customer/booking" class="ds-btn ds-btn-primary ds-btn-pill">Book a Scooter</RouterLink>
          <RouterLink to="/customer/map" class="ds-btn ds-btn-secondary ds-btn-pill">Open Live Map</RouterLink>
        </div>
        <div class="hero-tags">
          <span>5 Stations</span>
          <span>Live Status</span>
          <span>Manager Console</span>
        </div>
      </article>

      <article class="hero-side">
        <div class="snapshot-head">
          <h3>Operations Snapshot</h3>
          <RouterLink to="/customer/scooters">View Fleet</RouterLink>
        </div>
        <div class="snapshot-grid">
          <article><small>Available Scooters</small><strong>25</strong></article>
          <article><small>Active Trips</small><strong>12</strong></article>
          <article><small>Open Reports</small><strong>3</strong></article>
          <article><small>Response Time</small><strong>&lt; 2m</strong></article>
        </div>
        <div class="mini-map" aria-hidden="true">
          <span class="node a"></span>
          <span class="node b"></span>
          <span class="node c"></span>
        </div>
      </article>
    </section>

    <section class="block">
      <header class="block-head">
        <h2>How It Works</h2>
        <p>From account login to ride management in three steps.</p>
      </header>
      <div class="cards-3">
        <article v-for="item in workflow" :key="item.step" class="feature-card">
          <span class="step">{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="block">
      <header class="block-head">
        <h2>Featured Scooters</h2>
        <RouterLink to="/customer/scooters" class="block-link">Browse All</RouterLink>
      </header>
      <div class="cards-3">
        <article v-for="item in featured" :key="item.id" class="scooter-card">
          <div class="thumb">{{ item.id }}</div>
          <h3>{{ item.area }}</h3>
          <p>{{ item.price }}</p>
          <span class="ds-badge" :class="item.statusClass">{{ item.status }}</span>
          <RouterLink to="/customer/booking" class="card-link">Book Now</RouterLink>
        </article>
      </div>
    </section>

    <section class="block">
      <header class="block-head">
        <h2>Platform Highlights</h2>
      </header>
      <div class="cards-4">
        <article v-for="item in highlights" :key="item.title" class="feature-card compact">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  display: grid;
  gap: 24px;
}

.hero {
  border: 1px solid #d6e2f2;
  border-radius: 18px;
  background:
    radial-gradient(circle at 0% 0%, rgb(187 213 255 / 45%), transparent 40%),
    linear-gradient(145deg, #fff 0%, #edf4ff 100%);
  padding: 24px;
  display: grid;
  gap: 14px;
  grid-template-columns: 1.15fr 0.85fr;
}

.hero-main {
  display: grid;
  gap: 10px;
}

.hero-kicker {
  margin: 0;
  color: #0b63d6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(36px, 5vw, 60px);
  line-height: 0.95;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
}

.hero-desc {
  margin: 0;
  max-width: 640px;
  color: #43556f;
}

.hero-actions {
  margin-top: 2px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-actions .ds-btn {
  min-height: 38px;
  padding: 0 13px;
  font-size: 14px;
  letter-spacing: 0;
  border-radius: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.hero-actions .ds-btn-primary {
  background: #0f5fcf;
  border-color: #0f5fcf;
  box-shadow: 0 6px 14px rgb(15 95 207 / 22%);
}

.hero-actions .ds-btn-secondary {
  background: #fff;
  border-color: #c6d6ef;
  color: #214a85;
}

.hero-actions .ds-btn:hover {
  transform: translateY(-1px);
}

.hero-tags {
  margin-top: 6px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-tags span {
  color: #5d7190;
  font-size: 13px;
  font-weight: 700;
  position: relative;
  padding-left: 14px;
}

.hero-tags span::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #0b63d6;
}

.hero-side {
  border: 1px solid #d8e2f1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
  padding: 14px;
  display: grid;
  gap: 10px;
}

.snapshot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.snapshot-head h3 {
  margin: 0;
  font-size: 22px;
  font-family: "Space Grotesk", sans-serif;
}

.snapshot-head a {
  color: #0b63d6;
  font-size: 13px;
  font-weight: 700;
}

.snapshot-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.snapshot-grid article {
  border: 1px solid #e0e8f4;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.snapshot-grid small {
  display: block;
  color: #64748b;
}

.snapshot-grid strong {
  font-size: 22px;
  font-family: "Space Grotesk", sans-serif;
}

.mini-map {
  min-height: 98px;
  border: 1px dashed #d1deef;
  border-radius: 12px;
  background:
    linear-gradient(90deg, transparent 49%, #dbe5f5 49.5%, #dbe5f5 50.5%, transparent 51%),
    linear-gradient(0deg, transparent 49%, #dbe5f5 49.5%, #dbe5f5 50.5%, transparent 51%),
    #f3f8ff;
  position: relative;
}

.node {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #0b63d6;
  position: absolute;
  box-shadow: 0 0 0 6px rgb(11 99 214 / 16%);
}

.node.a { left: 18%; top: 32%; }
.node.b { left: 48%; top: 22%; }
.node.c { left: 73%; top: 62%; }

.block {
  display: grid;
  gap: 10px;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 10px;
}

.block-head h2 {
  margin: 0;
  font-size: clamp(28px, 3.1vw, 40px);
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.02em;
}

.block-head p {
  margin: 0;
  color: #64748b;
}

.block-link {
  color: #0b63d6;
  font-weight: 700;
}

.cards-3,
.cards-4 {
  display: grid;
  gap: 12px;
}

.cards-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cards-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.feature-card,
.scooter-card {
  border: 1px solid #dbe5f2;
  border-radius: 14px;
  background: #fff;
  padding: 16px;
  box-shadow: 0 6px 16px rgb(15 23 42 / 5%);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.feature-card:hover,
.scooter-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 26px rgb(15 23 42 / 8%);
}

.feature-card h3,
.scooter-card h3 {
  margin: 10px 0 0;
  font-family: "Space Grotesk", sans-serif;
  font-size: 24px;
}

.feature-card p,
.scooter-card p {
  margin: 8px 0 0;
  color: #64748b;
}

.step {
  display: inline-block;
  font-weight: 700;
  color: #0b63d6;
}

.thumb {
  min-height: 96px;
  border: 1px dashed #ccd8ec;
  border-radius: 12px;
  background: #f5f9ff;
  display: grid;
  place-items: center;
  color: #35548f;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.card-link {
  display: inline-block;
  margin-top: 12px;
  color: #0b63d6;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.compact h3 {
  font-size: 21px;
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .cards-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .block-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .cards-3,
  .cards-4 {
    grid-template-columns: 1fr;
  }
}
</style>
