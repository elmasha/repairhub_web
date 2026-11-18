<template>
  <div class="landing-page" style="background-color: #F8FAFC; min-height: 100vh;">
    
    <!-- Header -->
    <header style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; position: sticky; top: 0; z-index: 100;">
      <div class="d-flex align-center justify-space-between" style="max-width: 1200px; margin: 0 auto;">
        <a href="#top" class="font-weight-black text-h5" style="text-decoration: none; color: #121212;">
          <span style="color: #D32F2F;">Repair</span>Hub POS
        </a>
        <div class="d-flex align-center">
          <!-- Standard href anchors -->
          <a href="#how-it-works" class="nav-link text-decoration-none font-weight-bold text-black mr-6 hidden-sm-and-down">How it works</a>
          <a href="#pricing" class="nav-link text-decoration-none font-weight-bold text-black mr-6 hidden-sm-and-down">Pricing</a>
          <a href="#faq" class="nav-link text-decoration-none font-weight-bold text-black mr-6 hidden-sm-and-down">FAQ</a>
          <NuxtLink to="/login" class="text-decoration-none font-weight-bold text-black mr-4">Login</NuxtLink>
          <v-btn color="#D32F2F" dark class="text-none font-weight-bold px-6" to="/register">
            Get Started
          </v-btn>
        </div>
      </div>
    </header>

    <div id="top" style="position: absolute; top: 0;"></div>

    <!-- Hero Section -->
    <section class="text-center py-16 px-4" style="background: linear-gradient(180deg, #ffffff 0%, #F8FAFC 100%);">
      <div style="max-width: 900px; margin: 0 auto;">
        <div class="d-inline-block mb-4 px-4 py-1 rounded-pill font-weight-bold" style="background: #FEF2F2; color: #D32F2F; border: 1px solid #FECACA;">
          Built for Kenyan Repair Shops
        </div>
        
        <h1 class="text-h2 font-weight-black mb-4" style="color: #121212; line-height: 1.1; font-size: 3.5rem;">
          Stop using paper. <br>
          <span style="color: #D32F2F;">Start growing.</span>
        </h1>
        
        <p class="text-h6 text-grey-darken-1 mb-8" style="max-width: 700px; margin: 0 auto;">
          The easiest way to track repairs, manage inventory, and accept M-Pesa payments. All from one beautiful dashboard.
        </p>
        
        <div class="d-flex justify-center align-center mb-4 flex-wrap" style="gap: 16px;">
          <v-btn color="#D32F2F" x-large dark class="text-none font-weight-bold px-10" to="/register" elevation="4">
            Start 14-Day Free Trial
          </v-btn>
          <v-btn outlined x-large color="#121212" class="text-none font-weight-bold px-8" to="/login">
            View Demo
          </v-btn>
        </div>
        <p class="text-caption text-grey">No credit card required. Cancel anytime.</p>

        <div class="d-flex justify-center align-center mt-10 flex-wrap" style="gap: 32px; opacity: 0.6;">
          <div class="d-flex align-center text-caption font-weight-bold text-grey-darken-2">
            <v-icon small color="success" class="mr-1">mdi-check-circle</v-icon> M-Pesa Ready
          </div>
          <div class="d-flex align-center text-caption font-weight-bold text-grey-darken-2">
            <v-icon small color="success" class="mr-1">mdi-check-circle</v-icon> Offline Friendly
          </div>
          <div class="d-flex align-center text-caption font-weight-bold text-grey-darken-2">
            <v-icon small color="success" class="mr-1">mdi-check-circle</v-icon> 24/7 Support
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-16 px-4" id="how-it-works" style="background: #ffffff;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-2" style="color: #121212;">How it works</h2>
          <p class="text-h6 text-grey-darken-1">Get up and running in three simple steps.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4" class="text-center">
            <div class="step-circle mb-4">
              <span class="text-h4 font-weight-black" style="color: white;">1</span>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2">Create an Account</h3>
            <p class="text-body-2 text-grey-darken-1">Sign up your business in 60 seconds. No credit card required to start.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <div class="step-circle mb-4">
              <span class="text-h4 font-weight-black" style="color: white;">2</span>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2">Add Your Inventory</h3>
            <p class="text-body-2 text-grey-darken-1">Import your spare parts and accessories via CSV, or add them manually.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <div class="step-circle mb-4">
              <span class="text-h4 font-weight-black" style="color: white;">3</span>
            </div>
            <h3 class="text-h6 font-weight-bold mb-2">Start Tracking</h3>
            <p class="text-body-2 text-grey-darken-1">Intake devices, print receipts, and accept M-Pesa payments instantly.</p>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Feature Highlights -->
    <section class="py-16 px-4" style="background: #F8FAFC;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-2" style="color: #121212;">Everything you need to run your shop</h2>
          <p class="text-h6 text-grey-darken-1">Designed for speed, built for accuracy.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-card class="feature-card" outlined elevation="0" height="100%">
              <v-card-text class="pa-6">
                <div class="feature-icon mb-4"><v-icon size="32" color="#D32F2F">mdi-tools</v-icon></div>
                <h3 class="text-h6 font-weight-bold mb-2">Repair Tracking</h3>
                <p class="text-body-2 text-grey-darken-1">Track device intakes, assign technicians, and update status from Diagnosis to Delivery.</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="feature-card" outlined elevation="0" height="100%">
              <v-card-text class="pa-6">
                <div class="feature-icon mb-4"><v-icon size="32" color="#D32F2F">mdi-cash-register</v-icon></div>
                <h3 class="text-h6 font-weight-bold mb-2">Fast POS Checkout</h3>
                <p class="text-body-2 text-grey-darken-1">Sell accessories and spare parts with a lightning-fast point-of-sale system.</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="feature-card" outlined elevation="0" height="100%">
              <v-card-text class="pa-6">
                <div class="feature-icon mb-4"><v-icon size="32" color="#D32F2F">mdi-cellphone</v-icon></div>
                <h3 class="text-h6 font-weight-bold mb-2">M-Pesa Integration</h3>
                <p class="text-body-2 text-grey-darken-1">Instantly reconcile M-Pesa payments against repair tickets and POS sales.</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 px-4" style="background: #ffffff;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <div class="text-center mb-10">
          <h2 class="text-h3 font-weight-bold mb-2" style="color: #121212;">Loved by shop owners</h2>
          <p class="text-h6 text-grey-darken-1">Join hundreds of repair shops across Kenya.</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-6" outlined elevation="0" height="100%">
              <div class="d-flex mb-2">
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="text-body-2 mb-4 font-italic" style="color: #333;">"Before RepairHub, we used a notebook for all our tickets. We were losing track of devices and losing money. Now everything is on the dashboard."</p>
              <div class="d-flex align-center">
                <v-avatar color="#E2E8F0" size="32" class="mr-3"><v-icon small>mdi-account</v-icon></v-avatar>
                <div>
                  <div class="font-weight-bold text-caption">David M.</div>
                  <div class="text-caption text-grey">Luthuli Avenue, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-6" outlined elevation="0" height="100%">
              <div class="d-flex mb-2">
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="text-body-2 mb-4 font-italic" style="color: #333;">"The M-Pesa reconciliation feature alone saves me 2 hours a day. I used to check my phone messages manually. Now it's instant."</p>
              <div class="d-flex align-center">
                <v-avatar color="#E2E8F0" size="32" class="mr-3"><v-icon small>mdi-account</v-icon></v-avatar>
                <div>
                  <div class="font-weight-bold text-caption">Sarah K.</div>
                  <div class="text-caption text-grey">River Road, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="testimonial-card pa-6" outlined elevation="0" height="100%">
              <div class="d-flex mb-2">
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
                <v-icon color="#FFC107" small>mdi-star</v-icon>
              </div>
              <p class="text-body-2 mb-4 font-italic" style="color: #333;">"My technicians love the dashboard. They can see their assigned repairs immediately when they log in. Very simple to use."</p>
              <div class="d-flex align-center">
                <v-avatar color="#E2E8F0" size="32" class="mr-3"><v-icon small>mdi-account</v-icon></v-avatar>
                <div>
                  <div class="font-weight-bold text-caption">John N.</div>
                  <div class="text-caption text-grey">Westlands, Nairobi</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-16 px-4" id="pricing" style="background: #F8FAFC;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <div class="text-center mb-10">
          <h2 class="text-h3 font-weight-bold mb-2" style="color: #121212;">Simple, transparent pricing</h2>
          <p class="text-h6 text-grey-darken-1">One flat rate. No hidden fees.</p>
        </div>

        <v-row justify="center">
          <!-- Starter Plan -->
          <v-col cols="12" md="5">
            <v-card class="pricing-card" outlined elevation="0">
              <div class="pa-6">
                <h3 class="text-h5 font-weight-bold mb-2">Starter</h3>
                <div class="d-flex align-end mb-4">
                  <span class="text-h3 font-weight-black">KES 1,500</span>
                  <span class="text-subtitle-1 text-grey ml-2 mb-1">/month</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-6">Perfect for single-location phone & laptop repair shops.</p>
                <v-list dense class="transparent">
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> 1 Branch</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> Unlimited Repairs & Sales</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> Inventory Management</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> M-Pesa Payment Tracking</v-list-item>
                </v-list>
              </div>
              <v-divider></v-divider>
              <v-card-actions class="pa-6">
                <v-btn block outlined color="#D32F2F" class="text-none font-weight-bold" height="44" to="/register">
                  Start Free Trial
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- Pro Plan -->
          <v-col cols="12" md="5">
            <v-card class="pricing-card featured-card" elevation="12">
              <div class="featured-badge">MOST POPULAR</div>
              <div class="pa-6">
                <h3 class="text-h5 font-weight-bold mb-2">Pro</h3>
                <div class="d-flex align-end mb-4">
                  <span class="text-h3 font-weight-black">KES 3,000</span>
                  <span class="text-subtitle-1 text-grey ml-2 mb-1">/month</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-6">For busy shops with multiple technicians and higher volume.</p>
                <v-list dense class="transparent">
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> Everything in Starter</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> Up to 5 Staff Accounts</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> SMS Customer Notifications</v-list-item>
                  <v-list-item class="px-0"><v-icon color="success" small class="mr-2">mdi-check</v-icon> Daily Sales Reports</v-list-item>
                </v-list>
              </div>
              <v-divider></v-divider>
              <v-card-actions class="pa-6">
                <v-btn block color="#D32F2F" dark class="text-none font-weight-bold" height="44" to="/register">
                  Start Free Trial
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 px-4" id="faq" style="background: #ffffff;">
      <div style="max-width: 800px; margin: 0 auto;">
        <div class="text-center mb-10">
          <h2 class="text-h3 font-weight-bold mb-2" style="color: #121212;">Frequently Asked Questions</h2>
        </div>

        <v-expansion-panels accordion flat>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1">Do I need to buy special hardware to use this?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              Not at all. RepairHub runs entirely in your web browser. It works perfectly on your existing laptop, desktop, or even your smartphone. If you have a standard 80mm thermal printer, you can print receipts directly from the system.
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1">How does the M-Pesa integration work?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              When a customer pays via M-Pesa Paybill or Till Number, you simply paste the transaction reference code into the system. RepairHub matches it to the ticket and records the payment instantly. (Automatic Daraja STK Push coming soon).
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1">Can I add multiple staff members?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              Yes. The Pro plan allows you to add up to 5 staff accounts with different permission levels (Admin, Technician, Cashier). They each get their own secure login.
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-bold text-body-1">What happens after the 14-day trial?</v-expansion-panel-header>
            <v-expansion-panel-content class="text-body-2 text-grey-darken-2">
              After 14 days, you will be prompted to choose a plan to continue using the software. Your data remains safe. If you decide not to continue, you can export your data at any time.
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-16 px-4" style="background: #D32F2F;">
      <div class="text-center" style="max-width: 800px; margin: 0 auto;">
        <h2 class="text-h3 font-weight-black text-white mb-4">Ready to modernize your shop?</h2>
        <p class="text-h6 text-white mb-8" style="opacity: 0.9;">Join the growing network of smart repair shops.</p>
        <v-btn x-large color="white" class="text-none font-weight-bold" style="color: #D32F2F !important;" to="/register">
          Get Started for Free
        </v-btn>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="text-center py-6 text-grey" style="border-top: 1px solid #e2e8f0; background: #ffffff;">
      &copy; {{ new Date().getFullYear() }} RepairHub POS. All rights reserved.
    </footer>
  </div>
</template>

<script>
export default {
  layout: 'blank'
}
</script>

<style>
/* GLOBAL CSS */
html {
  scroll-behavior: smooth;
  /* Removed scroll-padding-top so it stops jumping too far */
}

.landing-page { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

.nav-link {
  color: #121212;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #D32F2F !important;
}

/* Step Circles */
.step-circle {
  width: 64px;
  height: 64px;
  background-color: #D32F2F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

/* Feature Cards */
.feature-card { border-radius: 12px; transition: all 0.2s ease; }
.feature-card:hover { transform: translateY(-4px); border-color: #D32F2F; }
.feature-icon {
  background: #FEF2F2;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Testimonials */
.testimonial-card { border-radius: 12px; }

/* Pricing */
.pricing-card { border-radius: 16px; height: 100%; display: flex; flex-direction: column; transition: transform 0.2s; }
.pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.05) !important; }
.pricing-card .v-card__actions { margin-top: auto; }
.featured-card { border: 2px solid #D32F2F; position: relative; }
.featured-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #D32F2F;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 16px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.v-list-item { min-height: 32px; }
.v-expansion-panel { border: 1px solid #e2e8f0 !important; border-radius: 8px !important; margin-bottom: 8px; }
</style>