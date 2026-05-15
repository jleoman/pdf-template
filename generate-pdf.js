// ============================================
// FINAL WORKING VERSION - Measures REAL heights with Puppeteer
// ============================================
const puppeteer = require('puppeteer-core');
const fs = require('fs');

// ============================================
// STEP 1: CREATE HTML TEMPLATE WITH ALL SECTIONS
// ============================================
function createTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: white;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Each A4 page */
    .page {
      width: 794px;
      height: 1123px;
      padding: 40px;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      background: white;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* ROUNDED WRAPPER */
    .wrapper {
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 16px;
      background: white;
    }

    .wrapper.continued {
      border-left: 4px solid #3b82f6;
    }

    /* SECTION HEADER */
    .section-header {
      background: #f8fafc;
      padding: 14px 20px;
      border-bottom: 1px solid #e2e8f0;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* SECTION BODY */
    .section-body {
      padding: 16px 20px;
      font-size: 13px;
    }

    /* TABLE - WITH ROUNDED CORNERS */
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 12px;
    }

    /* Top corners on header */
    .data-table thead tr:first-child th:first-child {
      border-top-left-radius: 16px;
    }
    .data-table thead tr:first-child th:last-child {
      border-top-right-radius: 16px;
    }

    /* Bottom corners on last row */
    .data-table tbody tr:last-child td:first-child {
      border-bottom-left-radius: 16px;
    }
    .data-table tbody tr:last-child td:last-child {
      border-bottom-right-radius: 16px;
    }

    .data-table th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background: #f8fafc;
    }

    /* BANK HEADER */
    .bank-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
      color: white;
      padding: 24px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bank-name {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    /* INFO GRID */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 600;
    }

    .info-value {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    /* BENEFITS */
    .benefits-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .benefit-tag {
      background: #ecfdf5;
      color: #059669;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }

    /* STATUS BADGES */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .status-active {
      background: #dcfce7;
      color: #166534;
    }

    .status-inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    /* FOOTER */
    .page-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      padding: 16px 40px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
      background: white;
    }

    /* MEASUREMENT HELPERS */
    .measure-box {
      border: 1px solid red;
    }
  </style>
</head>
<body>
  <div id="pages-container"></div>
</body>
</html>`;
}

// ============================================
// STEP 2: DATA
// ============================================
const cardData = {
  bankName: 'HDFC BANK',
  cardHolder: 'RAHUL SHARMA',
  cardNumber: '**** **** **** 4521',
  statementDate: '15 Feb 2024',
  creditLimit: 'Rs 5,00,000'
};

function generateTransactions(count) {
  const transactions = [];
  const descriptions = [
    'Amazon India Pvt Ltd', 'Swiggy', 'Zomato', 'Uber India',
    'Flipkart Internet Pvt', 'Netflix Subscription', 'Spotify Premium',
    'Apollo Pharmacy', 'BigBasket', 'Myntra Designs',
    'Paytm Mobile Solutions', 'Ola Cabs', 'BookMyShow',
    'Tata Cliq', 'Jio Prepaid Recharge', 'Airtel Bill Payment',
    'DMart Grocery', 'Croma Retail', 'Titan Company',
    'MakeMyTrip India', 'Yatra Online', 'Goibibo',
    'Zerodha Broking', 'PhonePe', 'Google Play',
    'Apple Services', 'Microsoft Store', 'Adobe Inc',
    'LinkedIn Premium', 'Coursera Subscription'
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date(2024, 1, 15 + Math.floor(i / 3));
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    transactions.push({
      date: `${day}/${month}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      amount: `Rs ${(Math.random() * 5000 + 100).toFixed(2)}`,
      type: Math.random() > 0.8 ? 'Credit' : 'Debit'
    });
  }
  return transactions;
}

function generateEMIData() {
  return [
    { month: 'Feb 2024', principal: 'Rs 4,500', interest: 'Rs 450', emi: 'Rs 4,950', balance: 'Rs 40,500' },
    { month: 'Mar 2024', principal: 'Rs 4,550', interest: 'Rs 400', emi: 'Rs 4,950', balance: 'Rs 35,950' },
    { month: 'Apr 2024', principal: 'Rs 4,600', interest: 'Rs 350', emi: 'Rs 4,950', balance: 'Rs 31,350' },
  ];
}

function generateRewardData() {
  return [
    { category: 'Shopping', points: '2,450', value: 'Rs 1,225' },
    { category: 'Dining', points: '1,200', value: 'Rs 600' },
    { category: 'Travel', points: '3,800', value: 'Rs 1,900' },
    { category: 'Fuel', points: '950', value: 'Rs 475' },
    { category: 'Others', points: '600', value: 'Rs 300' },
  ];
}

function generateFeeData() {
  return [
    { fee: 'Annual Fee', amount: 'Rs 2,999', waived: 'Spend Rs 2L/year' },
    { fee: 'Late Payment', amount: 'Rs 1,500', waived: 'N/A' },
    { fee: 'Foreign Transaction', amount: '3.5%', waived: 'N/A' },
    { fee: 'Cash Withdrawal', amount: '2.5%', waived: 'N/A' },
  ];
}

// ============================================
// STEP 3: RENDER FUNCTIONS
// ============================================
function renderBankHeader() {
  return `
    <div class="bank-header">
      <div>
        <div class="bank-name">${cardData.bankName}</div>
        <div style="font-size:11px;opacity:0.8;letter-spacing:1px;">We understand your world</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;opacity:0.8;">Credit Card Statement</div>
        <div style="font-size:14px;font-weight:700;">${cardData.statementDate}</div>
      </div>
    </div>
  `;
}

function renderCardInfo() {
  return `
    <div class="section-header"><span>💳</span> Card Information</div>
    <div class="section-body">
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Card Number</span><span class="info-value">${cardData.cardNumber}</span></div>
        <div class="info-item"><span class="info-label">Card Holder</span><span class="info-value">${cardData.cardHolder}</span></div>
        <div class="info-item"><span class="info-label">Statement Date</span><span class="info-value">${cardData.statementDate}</span></div>
        <div class="info-item"><span class="info-label">Credit Limit</span><span class="info-value">${cardData.creditLimit}</span></div>
      </div>
    </div>
  `;
}

function renderBenefits() {
  return `
    <div class="section-header"><span>🎁</span> Benefits & Rewards</div>
    <div class="section-body">
      <div class="benefits-row">
        <span class="benefit-tag">5% Cashback on Shopping</span>
        <span class="benefit-tag">Airport Lounge Access</span>
        <span class="benefit-tag">Fuel Surcharge Waiver</span>
      </div>
    </div>
  `;
}

function renderImportantInfo() {
  return `
    <div class="section-header"><span>ℹ️</span> Important Information</div>
    <div class="section-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Total Amount Due</div><div style="font-size:20px;font-weight:800;color:#0f172a;">Rs 45,230.00</div></div>
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Minimum Amount Due</div><div style="font-size:20px;font-weight:800;color:#0f172a;">Rs 2,261.50</div></div>
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Payment Due Date</div><div style="font-size:14px;font-weight:700;color:#0f172a;">05 Mar 2024</div></div>
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Available Credit</div><div style="font-size:14px;font-weight:700;color:#0f172a;">Rs 3,24,550</div></div>
      </div>
    </div>
  `;
}

function renderCardControl() {
  return `
    <div class="section-header"><span>🔒</span> Card Control Settings</div>
    <div class="section-body">
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <span class="status-badge status-active">● Online: Active</span>
        <span class="status-badge status-active">● International: Active</span>
        <span class="status-badge status-active">● Contactless: Active</span>
        <span class="status-badge status-inactive">● ATM: Blocked</span>
      </div>
    </div>
  `;
}

function renderPurchaseIndicator() {
  return `
    <div class="section-header"><span>📊</span> Purchase Overview</div>
    <div class="section-body">
      <div style="display:flex;gap:32px;">
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Domestic</div><div style="font-size:16px;font-weight:700;">Rs 32,450</div></div>
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">International</div><div style="font-size:16px;font-weight:700;">Rs 12,780</div></div>
        <div><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Transactions</div><div style="font-size:16px;font-weight:700;">45</div></div>
      </div>
    </div>
  `;
}

function renderOfferCard() {
  return `
    <div class="section-header" style="background:linear-gradient(90deg,#dbeafe 0%,#eff6ff 100%);color:#1e40af;"><span>🎉</span> Limited Time Offer</div>
    <div class="section-body" style="background:#eff6ff;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-weight:700;color:#1e40af;">Get 10X Reward Points on SmartBuy</div><div style="font-size:11px;color:#3b82f6;">Valid till 31 March 2024</div></div>
        <div style="background:#3b82f6;color:white;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;">Activate Now</div>
      </div>
    </div>
  `;
}

function renderTable(wrapper) {
  const headers = {
    emiTable: ['Month', 'Principal', 'Interest', 'EMI Amount', 'Outstanding'],
    rewardTable: ['Category', 'Points Earned', 'Value (Rs)'],
    feesTable: ['Fee Type', 'Amount', 'Waiver Condition']
  };
  const keys = {
    emiTable: ['month', 'principal', 'interest', 'emi', 'balance'],
    rewardTable: ['category', 'points', 'value'],
    feesTable: ['fee', 'amount', 'waived']
  };
  const headerRow = headers[wrapper.id];
  const dataKeys = keys[wrapper.id];

  return `
    <div class="section-header"><span>📋</span> ${wrapper.name}</div>
    <div class="section-body" style="padding:0;">
      <table class="data-table">
        <thead><tr>${headerRow.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${wrapper.data.map(row => `<tr>${dataKeys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

function renderTransactionTable(wrapper) {
  return `
    <div class="section-header" style="${!wrapper.isFirstFragment ? 'background:#eff6ff;color:#1e40af;' : ''}">
      <span>📄</span> ${wrapper.name}${!wrapper.isFirstFragment ? ' (Continued)' : ''}
      <span style="margin-left:auto;font-size:11px;opacity:0.7;font-weight:500;">${wrapper.totalRows ? `${wrapper.rowsOnThisPage} of ${wrapper.totalRows} rows` : ''}</span>
    </div>
    <div class="section-body" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Type</th></tr></thead>
        <tbody>
          ${wrapper.data.map((row, idx) => `
            <tr style="${idx % 2 === 0 ? '' : 'background:#f8fafc;'}">
              <td style="white-space:nowrap;font-weight:500;">${row.date}</td>
              <td>${row.description}</td>
              <td style="font-weight:700;${row.type === 'Credit' ? 'color:#059669;' : 'color:#0f172a;'}">${row.amount}</td>
              <td><span class="status-badge ${row.type === 'Credit' ? 'status-active' : 'status-inactive'}">${row.type}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============================================
// STEP 4: MEASURE REAL HEIGHTS WITH PUPPETEER
// ============================================
async function measureHeights(browser) {
  const page = await browser.newPage();

  // Create a test HTML with all sections
  const testHTML = createTemplate().replace(
    '<div id="pages-container"></div>',
    `
    <div class="page">
      <div id="test-header" class="wrapper">${renderBankHeader()}</div>
      <div id="test-cardInfo" class="wrapper">${renderCardInfo()}</div>
      <div id="test-benefits" class="wrapper">${renderBenefits()}</div>
      <div id="test-importantInfo" class="wrapper">${renderImportantInfo()}</div>
      <div id="test-cardControl" class="wrapper">${renderCardControl()}</div>
      <div id="test-purchaseIndicator" class="wrapper">${renderPurchaseIndicator()}</div>
      <div id="test-offerCard" class="wrapper">${renderOfferCard()}</div>
      <div id="test-emiTable" class="wrapper">${renderTable({ id: 'emiTable', name: 'EMI Summary', data: generateEMIData() })}</div>
      <div id="test-rewardTable" class="wrapper">${renderTable({ id: 'rewardTable', name: 'Reward Summary', data: generateRewardData() })}</div>
      <div id="test-feesTable" class="wrapper">${renderTable({ id: 'feesTable', name: 'Fees & Charges', data: generateFeeData() })}</div>

      <!-- Test transaction tables with different row counts -->
      <div id="test-transaction-1" class="wrapper">${renderTransactionTable({ id: 'transactionTable', name: 'Domestic Transactions', data: generateTransactions(1), isFirstFragment: true, totalRows: 1, rowsOnThisPage: 1 })}</div>
      <div id="test-transaction-5" class="wrapper">${renderTransactionTable({ id: 'transactionTable', name: 'Domestic Transactions', data: generateTransactions(5), isFirstFragment: true, totalRows: 5, rowsOnThisPage: 5 })}</div>
    </div>
    `
  );

  fs.writeFileSync('measure.html', testHTML);
  await page.goto('file://' + __dirname + '/measure.html', { waitUntil: 'networkidle0' });

  // Measure each element
  const heights = await page.evaluate(() => {
    const ids = [
      'test-header', 'test-cardInfo', 'test-benefits', 'test-importantInfo',
      'test-cardControl', 'test-purchaseIndicator', 'test-offerCard',
      'test-emiTable', 'test-rewardTable', 'test-feesTable',
      'test-transaction-1', 'test-transaction-5'
    ];

    const result = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        result[id] = Math.round(rect.height);
      }
    });
    return result;
  });

  await page.close();
  fs.unlinkSync('measure.html');

  // Calculate per-row height
  const transaction1Height = heights['test-transaction-1'];
  const transaction5Height = heights['test-transaction-5'];
  const headerHeight = transaction1Height - (heights['test-transaction-5'] - transaction1Height) / 4;
  const perRowHeight = (transaction5Height - transaction1Height) / 4;

  return {
    header: heights['test-header'],
    cardInfo: heights['test-cardInfo'],
    benefits: heights['test-benefits'],
    importantInfo: heights['test-importantInfo'],
    cardControl: heights['test-cardControl'],
    purchaseIndicator: heights['test-purchaseIndicator'],
    offerCard: heights['test-offerCard'],
    emiTable: heights['test-emiTable'],
    rewardTable: heights['test-rewardTable'],
    feesTable: heights['test-feesTable'],
    transactionHeader: Math.round(headerHeight),
    transactionRow: Math.round(perRowHeight)
  };
}

// ============================================
// STEP 5: BUILD PAGES WITH REAL MEASURED HEIGHTS
// ============================================
function buildPages(measured) {
  const PAGE_HEIGHT = 1123 - 50 - 40; // Total - footer - top padding buffer
  const BOTTOM_MARGIN = 50;
  const START_Y = 0;

  let currentY = START_Y;
  let pages = [{ pageNumber: 1, wrappers: [] }];

  console.log(`\n📐 PAGE HEIGHT: ${PAGE_HEIGHT}px | FOOTER: ${BOTTOM_MARGIN}px`);
  console.log(`📐 USABLE SPACE: ${PAGE_HEIGHT}px\n`);
  console.log('📏 MEASURED HEIGHTS:');
  Object.entries(measured).forEach(([k, v]) => console.log(`   ${k}: ${v}px`));
  console.log('');

  const sections = [
    { id: 'header', type: 'fixed', height: measured.header, name: 'Bank Header' },
    { id: 'cardInfo', type: 'fixed', height: measured.cardInfo, name: 'Card Information' },
    { id: 'benefits', type: 'fixed', height: measured.benefits, name: 'Benefits' },
    { id: 'importantInfo', type: 'fixed', height: measured.importantInfo, name: 'Important Information' },
    { id: 'cardControl', type: 'fixed', height: measured.cardControl, name: 'Card Control' },
  
    { id: 'emiTable', type: 'optional', height: measured.emiTable, name: 'EMI Summary', data: generateEMIData() },
    { id: 'rewardTable', type: 'optional', height: measured.rewardTable, name: 'Reward Summary', data: generateRewardData() },
    
    { 
      id: 'transactionTable', 
      type: 'dynamic', 
      name: 'Domestic Transactions',
      headerHeight: measured.transactionHeader,
      rowHeight: measured.transactionRow,
      data: generateTransactions(45)
    },
      { id: 'purchaseIndicator', type: 'fixed', height: measured.purchaseIndicator, name: 'Purchase Indicator' },
    { id: 'offerCard', type: 'fixed', height: measured.offerCard, name: 'Limited Time Offer' },
    { id: 'feesTable', type: 'optional', height: measured.feesTable, name: 'Fees & Charges', data: generateFeeData() }
  ];

  for (let section of sections) {
    let sectionHeight;
    if (section.type === 'fixed') {
      sectionHeight = section.height;
    } else if (section.type === 'optional') {
      if (!section.data || section.data.length === 0) {
        console.log(`⏭️  SKIPPED: ${section.name} (no data)`);
        continue;
      }
      sectionHeight = section.height;
    } else if (section.type === 'dynamic') {
      sectionHeight = section.headerHeight + (section.data.length * section.rowHeight);
    }

    console.log(`\n📝 ${section.name}: needs ${sectionHeight}px | Current Y: ${currentY}px`);

    const maxAllowedY = PAGE_HEIGHT - BOTTOM_MARGIN;

    if (currentY + sectionHeight <= maxAllowedY) {
      pages[pages.length - 1].wrappers.push({ ...section, isComplete: true });
      currentY += sectionHeight;
      console.log(`   ✅ Page ${pages.length} | New Y: ${currentY}px | Remaining: ${maxAllowedY - currentY}px`);
    } else {
      console.log(`   ❌ Does NOT fit (only ${maxAllowedY - currentY}px available)`);

      if (section.type === 'dynamic') {
        console.log(`   ⚡ SPLITTING...`);
        let remainingData = [...section.data];
        let isFirstFragment = true;
        let fragmentNum = 1;

        while (remainingData.length > 0) {
          const availableSpace = maxAllowedY - currentY;
          const rowsThatFit = Math.floor((availableSpace - section.headerHeight) / section.rowHeight);

          if (rowsThatFit <= 0 && currentY === START_Y) {
            console.log(`   ⚠️  Forcing 1 row minimum`);
            rowsThatFit = 1;
          }

          if (rowsThatFit <= 0) {
            console.log(`   ⏎ New page ${pages.length + 1}`);
            pages.push({ pageNumber: pages.length + 1, wrappers: [] });
            currentY = START_Y;
            continue;
          }

          const rowsForThisPage = remainingData.slice(0, rowsThatFit);
          remainingData = remainingData.slice(rowsThatFit);
          const fragmentHeight = section.headerHeight + (rowsForThisPage.length * section.rowHeight);

          pages[pages.length - 1].wrappers.push({
            ...section,
            type: 'dynamic_fragment',
            data: rowsForThisPage,
            isFirstFragment: isFirstFragment,
            isLastFragment: remainingData.length === 0,
            totalRows: section.data.length,
            rowsOnThisPage: rowsForThisPage.length,
            fragmentHeight: fragmentHeight
          });

          currentY += fragmentHeight;
          console.log(`   ✅ Fragment ${fragmentNum}: ${rowsForThisPage.length} rows | Height: ${fragmentHeight}px | Y: ${currentY}px`);

          isFirstFragment = false;
          fragmentNum++;

          if (remainingData.length > 0) {
            console.log(`   📦 ${remainingData.length} remaining → new page`);
            pages.push({ pageNumber: pages.length + 1, wrappers: [] });
            currentY = START_Y;
          }
        }
      } else {
        console.log(`   ⏎ Moving to page ${pages.length + 1}`);
        pages.push({ pageNumber: pages.length + 1, wrappers: [] });
        currentY = START_Y;
        pages[pages.length - 1].wrappers.push({ ...section, isComplete: true });
        currentY += sectionHeight;
        console.log(`   ✅ Page ${pages.length} | Y: ${currentY}px`);
      }
    }
  }

  console.log(`\n✅ COMPLETE: ${pages.length} pages\n`);
  return pages;
}

// ============================================
// STEP 6: GENERATE FINAL HTML
// ============================================
function generateHTML(pages) {
  let html = '';
  for (let page of pages) {
    html += `<div class="page">`;
    for (let wrapper of page.wrappers) {
      html += renderWrapper(wrapper);
    }
    html += `<div class="page-footer"><span>Confidential - ${cardData.bankName} Statement</span><span>Page ${page.pageNumber} of ${pages.length}</span></div>`;
    html += `</div>`;
  }
  return html;
}

function renderWrapper(wrapper) {
  const isContinued = wrapper.type === 'dynamic_fragment' && !wrapper.isFirstFragment;
  const continuedClass = isContinued ? 'continued' : '';
  const totalText = wrapper.totalRows ? `${wrapper.rowsOnThisPage} of ${wrapper.totalRows} rows` : '';

  let html = `<div class="wrapper ${continuedClass}">`;
  switch (wrapper.id) {
    case 'header': html += renderBankHeader(); break;
    case 'cardInfo': html += renderCardInfo(); break;
    case 'benefits': html += renderBenefits(); break;
    case 'importantInfo': html += renderImportantInfo(); break;
    case 'cardControl': html += renderCardControl(); break;
    case 'purchaseIndicator': html += renderPurchaseIndicator(); break;
    case 'offerCard': html += renderOfferCard(); break;
    case 'emiTable':
    case 'rewardTable':
    case 'feesTable': html += renderTable(wrapper); break;
    case 'transactionTable':
    case 'dynamic_fragment': html += renderTransactionTable(wrapper); break;
  }
  html += `</div>`;
  return html;
}

// ============================================
// STEP 7: MAIN
// ============================================
async function main() {
  console.log('🚀 Starting PDF generation with REAL height measurement...\n');

  // Launch browser
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  // Step 1: Measure all heights
  console.log('📏 Step 1: Measuring real heights...');
  const measured = await measureHeights(browser);

  // Step 2: Build pages with real heights
  console.log('\n🏗️  Step 2: Building pages...');
  const pages = buildPages(measured);

  // Step 3: Generate HTML
  const contentHTML = generateHTML(pages);
  const template = createTemplate().replace('<div id="pages-container"></div>', contentHTML);
  fs.writeFileSync('temp-output.html', template);

  // Step 4: Generate PDF
  console.log('📄 Step 3: Generating PDF...');
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/temp-output.html', { waitUntil: 'networkidle0' });

  await page.pdf({
    path: 'credit-card-statement.pdf',
    width: '794px',
    height: '1123px',
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();
  fs.unlinkSync('temp-output.html');

  console.log('\n✅ SUCCESS! PDF created: credit-card-statement.pdf');
  console.log(`📄 Total pages: ${pages.length}`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});