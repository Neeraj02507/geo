// NAV OVERLAY
const navOverlay = document.getElementById('navOverlay');
const openNavBtn = document.getElementById('openNav');
const closeNavBtn = document.getElementById('closeNav');

// open overlay
openNavBtn.addEventListener('click', () => {
  navOverlay.classList.add('open');
  navOverlay.setAttribute('aria-hidden','false');
  // trap focus (basic)
  document.body.style.overflow = 'hidden';
  closeNavBtn.focus();
});

// close overlay
closeNavBtn.addEventListener('click', closeNav);
navOverlay.addEventListener('click', (e) => {
  if (e.target === navOverlay) closeNav();
});

function closeNav(){
  navOverlay.classList.remove('open');
  navOverlay.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  openNavBtn.focus();
}

// close when clicking any nav link with data-close
document.querySelectorAll('[data-close]').forEach(a => {
  a.addEventListener('click', () => {
    closeNav();
    // smooth scroll to target anchor
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const el = document.querySelector(href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// ESC to close overlay
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNav();
  }
});

/* Chart: van Genuchten */
let curveChart = null;
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

function generateCurve(){
  const alpha = parseFloat(document.getElementById("alpha").value) || 0.01;
  const n = parseFloat(document.getElementById("n").value) || 1.5;
  const theta_r = parseFloat(document.getElementById("theta_r").value) || 0.05;
  const theta_s = parseFloat(document.getElementById("theta_s").value) || 0.45;
  const m = 1 - 1 / n;

  const h = Array.from({ length: 200 }, (_, i) => i * 5);
  const theta = h.map(H => theta_r + (theta_s - theta_r) / Math.pow(1 + Math.pow(alpha * H, n), m));

  const ctx = document.getElementById('curveChart').getContext('2d');
  if (curveChart) curveChart.destroy();

  curveChart = new Chart(ctx, {
    type: 'line',
    data: { labels: h, datasets: [{ label: 'Volumetric Water Content (θ)', data: theta, borderColor: '#2bbf9e', backgroundColor:'rgba(43,191,158,0.12)', fill:true, pointRadius:0, tension:0.25 }] },
    options: {
      responsive:true, maintainAspectRatio:false,
      scales: {
        x:{ title:{ display:true, text:'Suction h (kPa)' }, ticks:{ color:'#08342b' }, grid:{ color:'rgba(8,52,43,0.03)' } },
        y:{ title:{ display:true, text:'Volumetric Water Content θ' }, ticks:{ color:'#08342b' }, min:0, max:1, grid:{ color:'rgba(8,52,43,0.03)' } }
      },
      plugins:{ legend:{ labels:{ color:'#08342b' } }, tooltip:{ backgroundColor:'#fff', titleColor:'#08342b', bodyColor:'#08342b' } }
    }
  });

  document.getElementById('explanation').innerHTML = `<strong>α = ${alpha}, n = ${n}, θr = ${theta_r}, θs = ${theta_s}.</strong><p class="muted" style="margin-top:8px">Higher n & α → steeper curve (coarser soils).</p>`;
}

generateBtn.addEventListener('click', generateCurve);

downloadBtn.addEventListener('click', () => {
  if(!curveChart){ alert('Generate the curve first.'); return; }
  const link = document.createElement('a');
  link.download = 'van_genuchten_curve.png';
  link.href = document.getElementById('curveChart').toDataURL('image/png',1);
  link.click();
});
