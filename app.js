// 1099 vs W2 Rate Calculator Engine
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);

  function calculate() {
    const w2Salary = parseFloat($('#w2-salary-input').value) || 0;
    const ptoWeeks = parseFloat($('#w2-pto-weeks').value) || 0;
    const matchPct = parseFloat($('#w2-401k-match').value) || 0;
    const healthMonthly = parseFloat($('#health-monthly').value) || 0;
    const bizExpenses = parseFloat($('#biz-expenses').value) || 0;
    const billableHoursPerWeek = parseFloat($('#billable-hours-week').value) || 36;
    const unpaidPtoWeeks = parseFloat($('#unpaid-pto-weeks').value) || 4;

    // 1. W2 Analysis
    const w2HourlyEquivalent = w2Salary / 2080;
    const employerFica = w2Salary * 0.0765;
    const employer401k = w2Salary * (matchPct / 100);
    const employerHealthValue = 500 * 12; // average employer health subsidy
    const totalW2PackageValue = w2Salary + employerFica + employer401k + employerHealthValue;

    // 2. 1099 Contractor Billing Weeks & Hours
    const workingWeeks = Math.max(1, 52 - unpaidPtoWeeks);
    const annualBillableHours = workingWeeks * billableHoursPerWeek;

    // 3. Contractor Extra Burdens to Replace W2 Take-Home:
    // Extra Self-Employment tax (the employer 7.65% half)
    const extraSeTaxGap = w2Salary * 0.0765;
    const annualHealthCost = healthMonthly * 12;
    const retirementGap = employer401k;

    // Target gross revenue required on 1099 to match net W2 financial value
    const target1099Gross = w2Salary + extraSeTaxGap + annualHealthCost + retirementGap + bizExpenses;
    const required1099Hourly = target1099Gross / annualBillableHours;

    const premiumPct = ((required1099Hourly - w2HourlyEquivalent) / w2HourlyEquivalent) * 100;

    return {
      w2Salary,
      w2HourlyEquivalent,
      target1099Gross,
      required1099Hourly,
      annualBillableHours,
      premiumPct,
      extraSeTaxGap,
      annualHealthCost,
      retirementGap,
      bizExpenses
    };
  }

  function render() {
    const res = calculate();

    $('#disp-w2-salary').textContent = res.w2Salary.toLocaleString('en-US');
    $('#disp-w2-hourly').textContent = `~$${res.w2HourlyEquivalent.toFixed(2)} / hr (40 hrs/wk, 52 wks)`;
    $('#disp-1099-rate').textContent = res.required1099Hourly.toFixed(2);
    $('#disp-premium-pct').textContent = `+${res.premiumPct.toFixed(0)}% premium to match W2`;

    // Breakdown pills
    const pillsContainer = $('#breakdown-pills');
    pillsContainer.innerHTML = `
      <span class="pill">+15.3% Self-Employment Tax Gap</span>
      <span class="pill">+$${res.annualHealthCost.toLocaleString()}/yr Self-Paid Health</span>
      <span class="pill">${res.annualBillableHours} Billed Hours / Yr</span>
    `;

    // Comparison Table
    const tbody = $('#comp-tbody');
    tbody.innerHTML = `
      <tr>
        <td><strong>Gross Cash Earnings</strong></td>
        <td>$${res.w2Salary.toLocaleString()}</td>
        <td><strong style="color: #3b82f6">$${Math.round(res.target1099Gross).toLocaleString()}</strong></td>
        <td>Needed to fund benefits & taxes</td>
      </tr>
      <tr>
        <td><strong>Payroll / SE Taxes</strong></td>
        <td>Employee pays 7.65%</td>
        <td>Contractor pays full 15.3%</td>
        <td>+$${Math.round(res.extraSeTaxGap).toLocaleString()} additional tax burden</td>
      </tr>
      <tr>
        <td><strong>Health Insurance</strong></td>
        <td>Subsidized by employer</td>
        <td>Self-paid out of pocket</td>
        <td>+$${Math.round(res.annualHealthCost).toLocaleString()} / year ACA insurance</td>
      </tr>
      <tr>
        <td><strong>Paid Time Off (PTO)</strong></td>
        <td>Paid 52 weeks / year</td>
        <td>Unpaid downtime ($0 / hr)</td>
        <td>Spreads income across ${res.annualBillableHours} working hours</td>
      </tr>
      <tr>
        <td><strong>Business Overhead</strong></td>
        <td>$0 (provided by company)</td>
        <td>$${res.bizExpenses.toLocaleString()} (deductible)</td>
        <td>Laptop, internet, software subscriptions</td>
      </tr>
    `;
  }

  ['#w2-salary-input', '#w2-pto-weeks', '#w2-401k-match', '#health-monthly', '#biz-expenses', '#billable-hours-week', '#unpaid-pto-weeks'].forEach(id => {
    const el = $(id);
    if (el) el.oninput = render;
  });

  render();
});
