<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="landing-header">
      <div class="container header-content">
        <a href="#top" class="brand">
          <v-icon color="#D32F2F" class="mr-2">mdi-tools</v-icon>
          <span style="color: #121212;">Repair</span><span style="color: #D32F2F;">Hub</span>
        </a>
        <div class="nav-links">
          <a href="#how-it-works" class="nav-link">How it works</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <a href="#faq" class="nav-link">FAQ</a>
          <NuxtLink to="/login" class="nav-link font-weight-bold">Login</NuxtLink>
          <v-btn color="#D32F2F" dark class="text-none font-weight-bold rounded-lg px-6" to="/register" elevation="0">
            Get Started
          </v-btn>
        </div>
      </div>
    </header>

    <div id="top"></div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-glow"></div>
      <div class="container text-center hero-content">
        <v-chip color="white" class="mb-6 font-weight-bold elevation-1" pill>
          <v-icon left small color="#D32F2F">mdi-rocket-launch</v-icon>
          Built for Kenyan Repair Shops
        </v-chip>
        
        <h1 class="hero-title mb-6">
          Stop using paper.<br>
          <span class="gradient-text">Start growing.</span>
        </h1>
        
        <p class="hero-subtitle mb-10">
          The easiest way to track repairs, manage inventory, and accept M-Pesa payments. All from one beautiful dashboard.
        </p>
        
        <div class="d-flex justify-center align-center flex-wrap" style="gap: 16px;">
          <v-btn color="#D32F2F" x-large dark class="text-none font-weight-bold px-10 rounded-lg hover-lift" to="/register" elevation="4">
            Start 14-Day Free Trial
          </v-btn>
          <v-btn outlined x-large color="#121212" class="text-none font-weight-bold px-8 rounded-lg bg-white" to="/login">
            View Demo
          </v-btn>
        </div>
        <p class="text-caption text-grey-darken-1 mt-4">No credit card required. Cancel anytime.</p>

        <div class="trust-badges mt-12">
          <div class="trust-item"><v-icon small color="success">mdi-check-circle</v-icon> M-Pesa Ready</div>
          <div class="trust-item"><v-icon small color="success">mdi-check-circle</v-icon> Offline Friendly</div>
          <div class="trust-item"><v-icon small color="success">mdi-check-circle</v-icon> 24/7 Support</div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20" id="how-it-works">
      <div class="container">
        <div class="text-center mb-16">
          <h2 class="section-title">How it works</h2>
          <p class="section-subtitle">Get up and running in three simple steps.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4" class="text-center px-6">
            <div class="modern-step-circle mb-6">
              <span class="step-number">1</span>
            </div>
            <h3 class="step-title">Create an Account</h3>
            <p class="step-desc">Sign up your business in 60 seconds. No credit card required to start.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center px-6">
            <div class="modern-step-circle mb-6">
              <span class="step-number">2</span>
            </div>
            <h3 class="step-title">Add Your Inventory</h3>
            <p class="step-desc">Import your spare parts and accessories via CSV, or add them manually.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center px-6">
            <div class="modern-step-circle mb-6">
              <span class="step-number">3</span>
            </div>
            <h3 class="step-title">Start Tracking</h3>
            <p class="step-desc">Intake devices, print receipts, and accept M-Pesa payments instantly.</p>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Feature Highlights -->
    <section class="py-20" style="background: #F8FAFC;">
      <div class="container">
        <div class="text-center mb-16">
          <h2 class="section-title">Everything you need to run your shop</h2>
          <p class="section-subtitle">Designed for speed, built for accuracy.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-card class="modern-feature-card" outlined elevation="0" height="100%">
              <div class="feature-icon-bg"><v-icon size="32" color="#D32F2F">mdi-tools</v-icon></div>
              <h3 class="feature-title">Repair Tracking</h3>
              <p class="feature-desc">Track device intakes, assign technicians, and update status from Diagnosis to Delivery.</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="modern-feature-card" outlined elevation="0" height="100%">
              <div class="feature-icon-bg"><v-icon size="32" color="#D32F2F">mdi-cash-register</v-icon></div>
              <h3 class="feature-title">Fast POS Checkout</h3>
              <p class="feature-desc">Sell accessories and spare parts with a lightning-fast point-of-sale system.</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="modern-feature-card" outlined elevation="0" height="100%">
              <div class="feature-icon-bg"><v-icon size="32" color="#D32F2F">mdi-cellphone</v-icon></div>
              <h3 class="feature-title">M-Pesa Integration</h3>
              <p class="feature-desc">Instantly reconcile M-Pesa payments against repair tickets and POS sales.</p>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20">
      <div class="container">
        <div class="text-center mb-16">
          <h2 class="section-title">Loved by shop owners</h2>
          <p class="section-subtitle">Join hundreds of repair shops across Kenya.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-8" outlined elevation="0" height="100%">
              <div class="mb-4">
                <v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="testimonial-text">"Before RepairHub, we used a notebook for all our tickets. We were losing track of devices and losing money. Now everything is on the dashboard."</p>
              <div class="d-flex align-center mt-6">
                <v-avatar color="#FEF2F2" size="44" class="mr-3">
                  <span class="red--text font-weight-bold" style="color: #D32F2F !important;">DM</span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-2" style="color: #121212;">David M.</div>
                  <div class="text-caption text-grey-darken-1">Luthuli Avenue, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-8" outlined elevation="0" height="100%">
              <div class="mb-4">
                <v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="testimonial-text">"The M-Pesa reconciliation feature alone saves me 2 hours a day. I used to check my phone messages manually. Now it's instant."</p>
              <div class="d-flex align-center mt-6">
                <v-avatar color="#FEF2F2" size="44" class="mr-3">
                  <span class="red--text font-weight-bold" style="color: #D32F2F !important;">SK</span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-2" style="color: #121212;">Sarah K.</div>
                  <div class="text-caption text-grey-darken-1">River Road, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-8" outlined elevation="0" height="100%">
              <div class="mb-4">
                <v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon><v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="testimonial-text">"My technicians love the dashboard. They can see their assigned repairs immediately when they log in. Very simple to use."</p>
              <div class="d-flex align-center mt-6">
                <v-avatar color="#FEF2F2" size="44" class="mr-3">
                  <span class="red--text font-weight-bold" style="color: #D32F2F !important;">JN</span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-body-2" style="color: #121212;">John N.</div>
                  <div class="text-caption text-grey-darken-1">Westlands, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-20" id="pricing" style="background: #F8FAFC;">
      <div class="container">
        <div class="text-center mb-16">
          <h2 class="section-title">Simple, transparent pricing</h2>
          <p class="section-subtitle">One flat rate. No hidden fees.</p>
        </div>

        <v-row justify="center">
          <v-col v-for="(plan, index) in plans" :key="plan.id" cols="12" md="5">
            <v-card class="modern-pricing-card" :class="{ 'featured-plan': index === 1 }" outlined elevation="0">
              
              <div v-if="index === 1" class="featured-badge">MOST POPULAR</div>
              
              <div class="pa-8">
                <h3 class="plan-name">{{ plan.name }}</h3>
                <div class="d-flex align-end mb-6">
                  <span class="plan-price">KES {{ formatMoney(plan.priceKes) }}</span>
                  <span class="text-subtitle-1 text-grey ml-2 mb-1">/month</span>
                </div>
                <p class="plan-desc mb-8">
                  {{ index === 0 ? 'Perfect for single-location phone & laptop repair shops.' : 'For busy shops with multiple technicians and higher volume.' }}
                </p>
                <v-list dense class="transparent">
                  <v-list-item class="px-0 mb-2"><v-icon color="#4CAF50" small class="mr-3">mdi-check-circle</v-icon> <span class="feature-item-text">{{ plan.maxBranches }} Branch{{ plan.maxBranches > 1 ? 'es' : '' }}</span></v-list-item>
                  <v-list-item class="px-0 mb-2"><v-icon color="#4CAF50" small class="mr-3">mdi-check-circle</v-icon> <span class="feature-item-text">{{ plan.maxRepairs ? plan.maxRepairs + ' Repairs / mo' : 'Unlimited Repairs' }}</span></v-list-item>
                  <v-list-item class="px-0 mb-2"><v-icon color="#4CAF50" small class="mr-3">mdi-check-circle</v-icon> <span class="feature-item-text">Inventory Management</span></v-list-item>
                  <v-list-item class="px-0 mb-2"><v-icon color="#4CAF50" small class="mr-3">mdi-check-circle</v-icon> <span class="feature-item-text">M-Pesa Payment Tracking</span></v-list-item>
                  <v-list-item class="px-0 mb-2"><v-icon color="#4CAF50" small class="mr-3">mdi-check-circle</v-icon> <span class="feature-item-text">Up to {{ plan.maxUsers }} Staff Accounts</span></v-list-item>
                </v-list>
              </div>
              <v-divider></v-divider>
              <v-card-actions class="pa-8">
                <v-btn 
                  block 
                  :color="index === 1 ? '#D32F2F' : 'white'" 
                  :dark="index === 1" 
                  :outlined="index !== 1"
                  class="text-none font-weight-bold rounded-lg" 
                  height="50" 
                  to="/register"
                  :class="index !== 1 ? 'red--text' : ''"
                >
                  Start Free Trial
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-20" id="faq">
      <div class="container" style="max-width: 800px;">
        <div class="text-center mb-16">
          <h2 class="section-title">Frequently Asked Questions</h2>
        </div>

        <v-expansion-panels accordion flat class="modern-accordion">
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1" style="color: #121212;">Do I need to buy special hardware to use this?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              Not at all. RepairHub runs entirely in your web browser. It works perfectly on your existing laptop, desktop, or even your smartphone. If you have a standard 80mm thermal printer, you can print receipts directly from the system.
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1" style="color: #121212;">How does the M-Pesa integration work?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              When a customer pays via M-Pesa Paybill or Till Number, you simply paste the transaction reference code into the system. RepairHub matches it to the ticket and records the payment instantly. (Automatic Daraja STK Push coming soon).
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1" style="color: #121212;">Can I add multiple staff members?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              Yes. Our higher tier plans allow you to add staff accounts with different permission levels (Admin, Technician, Cashier). They each get their own secure login.
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1" style="color: #121212;">What happens after the 14-day trial?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              After 14 days, you will be prompted to choose a plan to continue using the software. Your data remains safe. If you decide not to continue, you can export your data at any time.
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 cta-section">
      <div class="cta-bg-glow"></div>
      <div class="container text-center" style="position: relative; z-index: 2; margin-top: 40px;">
        <h4 class="text-h4 font-weight-black mb-4" style="color: #ffffff !important;">Ready to modernize your shop?</h4>
        <p class="text-h6 mb-8" style="color: #a1a1aa !important;">Join the growing network of smart repair shops.</p>
        <v-btn x-large color="#D32F2F" dark class="text-none font-weight-bold px-10 rounded-lg hover-lift" to="/register" elevation="8">
          Get Started for Free
        </v-btn>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="text-center py-8 footer-section">
      <div class="container d-flex justify-space-between align-center flex-wrap">
        <div class="font-weight-bold" style="color: #ffffff !important;">
          <span style="color: #D32F2F !important;">Repair</span>Hub POS
        </div>
        <div class="text-caption mt-3 mt-sm-0" style="color: #a1a1aa !important;">
          &copy; {{ new Date().getFullYear() }} RepairHub POS. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      plans: []
    }
  },
  async asyncData({ $axios }) {
    try {
      const plans = await $axios.$get('/api/billing/plans')
      return { plans }
    } catch (e) {
      console.error('Failed to load plans', e)
      return { plans: [] }
    }
  },
  methods: {
    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    }
  }
}
</script>

<style>
/* GLOBAL CSS */
html {
  scroll-behavior: smooth;
}

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  overflow-x: hidden;
}

/* Header */
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  z-index: 1000;
  padding: 16px 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  display: flex;
  align-items: center;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #121212 !important;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #D32F2F !important;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 160px 0 100px 0;
  background: #ffffff;
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(211,47,47,0.08) 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -2px;
  color: #121212;
}

.gradient-text {
  background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.trust-badges {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Section Titles */
.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #121212;
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #64748b;
}

/* Steps */
.modern-step-circle {
  width: 80px;
  height: 80px;
  background: #ffffff;
  border: 2px solid #FEF2F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.1);
  position: relative;
}

.step-number {
  font-size: 2rem;
  font-weight: 900;
  color: #D32F2F;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #121212;
  margin-bottom: 12px;
}

.step-desc {
  color: #64748b;
  line-height: 1.6;
}

/* Features */
.modern-feature-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.modern-feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  border-color: #FEF2F2;
}

.feature-icon-bg {
  width: 64px;
  height: 64px;
  background: #FEF2F2;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #121212;
  margin-bottom: 12px;
}

.feature-desc {
  color: #64748b;
  line-height: 1.6;
}

/* Testimonials */
.testimonial-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  box-shadow: 0 20px 40px rgba(0,0,0,0.04);
}

.testimonial-text {
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
  font-style: italic;
}

/* Pricing */
.modern-pricing-card {
  border-radius: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.modern-pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.06);
}

.featured-plan {
  border: 2px solid #D32F2F;
  box-shadow: 0 20px 40px rgba(211, 47, 47, 0.1);
  position: relative;
}

.featured-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: #D32F2F;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 6px 20px;
  border-radius: 24px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #121212;
  margin-bottom: 8px;
}

.plan-price {
  font-size: 2.5rem;
  font-weight: 900;
  color: #121212;
  letter-spacing: -1px;
}

.plan-desc {
  color: #64748b;
  font-size: 0.95rem;
}

.feature-item-text {
  color: #475569;
  font-weight: 500;
}

/* FAQ */
.modern-accordion .v-expansion-panel {
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin-bottom: 12px;
  background: #ffffff !important;
}

.modern-accordion .v-expansion-panel-header {
  padding: 24px;
}

.modern-accordion .v-expansion-panel-content__wrap {
  padding: 0 24px 24px 24px;
}

/* CTA */
.cta-section {
  background: #121212;
  position: relative;
  overflow: hidden;
}

.cta-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(211,47,47,0.15) 0%, rgba(18,18,18,0) 70%);
  z-index: 0;
  pointer-events: none;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(211,47,47,0.2) !important;
}

/* Footer */
.footer-section {
  background: #121212;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Force white text in the dark section */
.cta-section h2,
.cta-section p,
.footer-section div,
.footer-section span {
  color: #ffffff !important;
}

.cta-section p {
  color: #a1a1aa !important;
}

.footer-section .text-caption {
  color: #a1a1aa !important;
}

/* Responsive */
@media (max-width: 960px) {
  .hero-title { font-size: 3rem; }
  .nav-links .nav-link { display: none; }
  .hero-section { padding-top: 120px; }
  .trust-badges { flex-wrap: wrap; }
}

@media (max-width: 600px) {
  .hero-title { font-size: 2.5rem; letter-spacing: -1px; }
  .hero-subtitle { font-size: 1rem; }
  .section-title { font-size: 2rem; }
  .featured-plan { margin-top: 16px; }
}
</style>