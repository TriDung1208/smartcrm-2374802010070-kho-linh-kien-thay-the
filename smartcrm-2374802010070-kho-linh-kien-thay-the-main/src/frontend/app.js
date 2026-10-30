import {
  getStock,
  issueStock,
  listCenters,
  listStocks,
  listTransactions,
  receiveStock
} from './api/stock.api.js';
import { login, register } from './api/auth.api.js';
import { showDataState } from './components/data-state.js';

const app = document.querySelector('#app');
const pageTitle = document.querySelector('#page-title');
const notice = document.querySelector('#notice');
const ITEMS_PER_PAGE = 20;
let selectedCenter = '';
let inventorySearch = '';
let lowStockOnly = false;
let inventoryStatusFilter = '';
let inventoryPage = 1;
let transactionPage = 1;
let pendingIssuePartId = null;
let transactionFilters = { type: '', partId: '', from: '', to: '' };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function iconButton(text, className, onClick) {
  const node = element('button', className, text);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

function showNotice(message, kind = 'success') {
  notice.className = `notice is-${kind}`;
  notice.textContent = message;
  notice.hidden = false;
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = '';
}

function setAuthenticatedUI(username) {
  document.body.classList.remove('auth-screen');
  document.querySelector('#session-user').textContent = username ? `Xin chào, ${username}` : 'Tài khoản';
  document.querySelector('#logout-button').hidden = false;
}

function showLoginScreen(message = '') {
  document.body.classList.add('auth-screen');
  document.querySelector('#logout-button').hidden = true;
  clearNotice();
  app.replaceChildren();

  let mode = 'login';
  const layout = element('section', 'auth-layout');
  const card = element('div', 'auth-card');
  const brand = element('div', 'auth-brand');
  brand.append(element('span', 'brand-mark', 'S'));
  const brandCopy = element('div');
  brandCopy.append(element('strong', '', 'Smart CRM'), element('span', '', 'Quản lý kho linh kiện'));
  brand.append(brandCopy);

  const title = element('h1', 'auth-title');
  const subtitle = element('p', 'auth-subtitle');
  const form = element('form', 'auth-form');
  const usernameLabel = element('label', 'field');
  usernameLabel.append(element('span', 'field-label', 'Tên đăng nhập'));
  const usernameInput = element('input', 'text-control');
  usernameInput.name = 'username';
  usernameInput.autocomplete = 'username';
  usernameInput.minLength = 3;
  usernameInput.maxLength = 32;
  usernameInput.required = true;
  usernameLabel.append(usernameInput);

  const passwordLabel = element('label', 'field');
  passwordLabel.append(element('span', 'field-label', 'Mật khẩu'));
  const passwordInput = element('input', 'text-control');
  passwordInput.name = 'password';
  passwordInput.type = 'password';
  passwordInput.autocomplete = 'current-password';
  passwordInput.minLength = 8;
  passwordInput.maxLength = 128;
  passwordInput.required = true;
  passwordLabel.append(passwordInput);

  const feedback = element('p', 'auth-feedback');
  const submit = element('button', 'button button-primary auth-submit');
  submit.type = 'submit';
  const toggle = element('button', 'text-button auth-toggle');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    mode = mode === 'login' ? 'register' : 'login';
    renderMode();
  });

  function renderMode() {
    const isRegister = mode === 'register';
    title.textContent = isRegister ? 'Tạo tài khoản' : 'Đăng nhập';
    subtitle.textContent = isRegister
      ? 'Tạo tài khoản để bắt đầu quản lý kho linh kiện.'
      : 'Đăng nhập để tiếp tục vào không gian làm việc.';
    passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
    submit.textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
    toggle.textContent = isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký';
    feedback.textContent = message;
    feedback.classList.toggle('is-error', Boolean(message));
    form.replaceChildren(usernameLabel, passwordLabel, feedback, submit, toggle);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message = '';
    feedback.textContent = '';
    submit.disabled = true;
    try {
      const authenticate = mode === 'register' ? register : login;
      const result = await authenticate(usernameInput.value, passwordInput.value);
      window.localStorage.setItem('token', result.token);
      window.localStorage.setItem('username', result.user.username);
      setAuthenticatedUI(result.user.username);
      openInventory();
    } catch (error) {
      message = error.message;
      feedback.textContent = message;
      feedback.classList.add('is-error');
    } finally {
      submit.disabled = false;
    }
  });

  renderMode();
  card.append(brand, title, subtitle, form);
  if (message) {
    feedback.textContent = message;
    feedback.classList.add('is-error');
  }
  layout.append(card);
  app.append(layout);
}

function setView(view) {
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === view);
  });
}

function setActiveCenter(centerId, centers) {
  const center = centers.find((item) => Number(item.center_id) === Number(centerId));
  document.querySelector('#active-center').textContent = center?.center_name || 'Trung tâm dịch vụ';
}

function showState(container, loader, render, emptyMessage) {
  showDataState(container, { loading: true });
  loader()
    .then((data) => {
      if (data?.length === 0 || data?.items?.length === 0) {
        showDataState(container, { empty: emptyMessage });
        return;
      }
      render(data);
    })
    .catch((error) => showDataState(container, {
      error,
      onRetry: () => showState(container, loader, render, emptyMessage)
    }));
}

function setPageHeading(title, description, actions = []) {
  pageTitle.textContent = title;
  const heading = element('div', 'page-heading');
  const copy = element('div');
  copy.append(element('h2', '', title), element('p', 'muted', description));
  const buttons = element('div', 'heading-actions');
  actions.forEach((action) => buttons.append(action));
  heading.append(copy, buttons);
  return heading;
}

function createCenterSelect(centers, value = selectedCenter) {
  const select = element('select', 'select-control');
  select.setAttribute('aria-label', 'Trung tâm dịch vụ');
  centers.forEach((center) => {
    const option = element('option', '', `${center.center_code} · ${center.center_name}`);
    option.value = center.center_id;
    select.append(option);
  });
  select.value = value || centers[0]?.center_id || '';
  return select;
}

function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) return '—';
  return `${Number(value).toLocaleString('vi-VN')} đ`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
}

function createPill(text, kind) {
  return element('span', `badge badge-${kind}`, text);
}

function createTable(columns, rows, emptyMessage) {
  const wrapper = element('div', 'table-wrap');
  if (rows.length === 0) {
    const empty = element('div', 'table-empty');
    empty.append(element('strong', '', 'Không tìm thấy linh kiện phù hợp.'));
    empty.append(element('p', '', emptyMessage));
    wrapper.append(empty);
    return wrapper;
  }

  const table = element('table', 'data-table');
  const head = element('thead');
  const header = element('tr');
  columns.forEach((column) => header.append(element('th', '', column.label)));
  head.append(header);

  const body = element('tbody');
  rows.forEach((row) => {
    const tableRow = element('tr');
    columns.forEach((column) => {
      const cell = element('td');
      const value = column.render(row);
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value ?? '—';
      tableRow.append(cell);
    });
    body.append(tableRow);
  });
  table.append(head, body);
  wrapper.append(table);
  return wrapper;
}

function createPagination(page, total, onChange, noun = 'dòng') {
  const pageCount = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const start = total ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const end = Math.min(page * ITEMS_PER_PAGE, total);
  const nav = element('div', 'pagination');
  nav.append(element('span', 'pagination-info', `Hiển thị ${start}–${end} / ${total} ${noun} · ${ITEMS_PER_PAGE} dòng/trang`));

  const controls = element('div', 'pagination-controls');
  const previous = iconButton('‹', 'page-button', () => onChange(page - 1));
  previous.disabled = page <= 1;
  const next = iconButton('›', 'page-button', () => onChange(page + 1));
  next.disabled = page >= pageCount;
  controls.append(previous, element('span', 'page-indicator', `${page} / ${pageCount}`), next);
  nav.append(controls);
  return nav;
}

function createMetric(label, value, tone, onClick) {
  const card = element(onClick ? 'button' : 'article', `metric-card ${tone || ''}`);
  if (onClick) {
    card.type = 'button';
    card.addEventListener('click', onClick);
  }
  card.append(element('span', 'metric-label', label), element('strong', 'metric-value', String(value)));
  return card;
}

async function openInventory() {
  setView('inventory');
  clearNotice();
  app.replaceChildren();
  const content = element('div');
  app.append(content);

  showState(content, async () => {
    const centers = await listCenters();
    selectedCenter = selectedCenter || centers[0]?.center_id || '';
    const stocks = await listStocks(selectedCenter);
    return { centers, stocks };
  }, ({ centers, stocks }) => renderInventory(content, centers, stocks), 'Không tìm thấy trung tâm hoặc dữ liệu tồn kho.');
}

function renderInventory(container, centers, stocks) {
  const activeCenter = selectedCenter || centers[0]?.center_id || '';
  selectedCenter = activeCenter;
  setActiveCenter(activeCenter, centers);
  const filtered = stocks.filter((stock) => {
    const query = inventorySearch.trim().toLocaleLowerCase('vi');
    const matchesText = !query
      || stock.partCode.toLocaleLowerCase('vi').includes(query)
      || stock.partName.toLocaleLowerCase('vi').includes(query);
    const matchesLow = !lowStockOnly || (stock.currentStock > 0 && stock.currentStock < stock.minThreshold);
    const matchesStatus = !inventoryStatusFilter || (
      inventoryStatusFilter === 'out' && stock.currentStock === 0
    );
    return matchesText && matchesLow && matchesStatus;
  });
  const lowCount = stocks.filter((stock) => stock.currentStock > 0 && stock.currentStock < stock.minThreshold).length;
  const outCount = stocks.filter((stock) => stock.currentStock === 0).length;
  const metrics = element('div', 'metrics-grid');
  metrics.append(
    createMetric('Tổng linh kiện tại trung tâm', stocks.length, '', null),
    createMetric('Dưới ngưỡng', lowCount, 'metric-warning', () => {
      lowStockOnly = !lowStockOnly;
      inventoryStatusFilter = '';
      inventoryPage = 1;
      openInventory();
    }),
    createMetric('Hết hàng', outCount, 'metric-danger', () => {
      lowStockOnly = false;
      inventoryStatusFilter = inventoryStatusFilter === 'out' ? '' : 'out';
      inventoryPage = 1;
      openInventory();
    })
  );

  const heading = setPageHeading(
    'Tồn kho linh kiện',
    'Tra cứu tồn kho và tình trạng linh kiện tại trung tâm dịch vụ.',
    [iconButton('Nhập kho', 'button button-secondary', () => openWarehouse('receipt')), iconButton('Xuất linh kiện', 'button button-primary', () => openIssue())]
  );

  const warning = element('button', 'warning-banner');
  warning.type = 'button';
  warning.append(
    element('span', 'warning-icon', '!'),
    element('span', '', `${lowCount + outCount} linh kiện đang dưới ngưỡng cảnh báo tại ${centers.find((center) => Number(center.center_id) === Number(activeCenter))?.center_name || 'trung tâm đang chọn'}.`),
    element('span', 'warning-link', lowStockOnly ? 'Xem tất cả' : 'Chỉ xem linh kiện dưới ngưỡng')
  );
  warning.addEventListener('click', () => {
    lowStockOnly = !lowStockOnly;
    inventoryStatusFilter = '';
    inventoryPage = 1;
    openInventory();
  });

  const toolbar = element('div', 'inventory-toolbar');
  const centerGroup = element('label', 'filter-group');
  centerGroup.append(element('span', 'filter-label', 'Trung tâm dịch vụ'));
  const centerSelect = createCenterSelect(centers, activeCenter);
  centerSelect.addEventListener('change', () => {
    selectedCenter = centerSelect.value;
    inventoryPage = 1;
    openInventory();
  });
  centerGroup.append(centerSelect);

  const searchGroup = element('label', 'search-group');
  searchGroup.append(element('span', 'filter-label', 'Mã hoặc tên linh kiện'));
  const searchRow = element('div', 'search-row');
  const searchInput = element('input', 'text-control');
  searchInput.type = 'search';
  searchInput.placeholder = 'Tìm mã LK hoặc tên linh kiện…';
  searchInput.value = inventorySearch;
  searchInput.dataset.inventorySearch = 'true';
  searchInput.setAttribute('aria-label', 'Mã hoặc tên linh kiện');
  const searchButton = iconButton('Tìm', 'button button-secondary', () => {
    inventorySearch = searchInput.value;
    inventoryPage = 1;
    openInventory();
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') searchButton.click();
  });
  searchRow.append(searchInput, searchButton);
  searchGroup.append(searchRow);

  const lowFilter = element('label', 'checkbox-filter');
  const checkbox = element('input');
  checkbox.type = 'checkbox';
  checkbox.checked = lowStockOnly;
  checkbox.addEventListener('change', () => {
    lowStockOnly = checkbox.checked;
    inventoryStatusFilter = '';
    inventoryPage = 1;
    openInventory();
  });
  lowFilter.append(checkbox, element('span', '', 'Dưới ngưỡng'));
  toolbar.append(centerGroup, searchGroup, lowFilter);

  const start = (inventoryPage - 1) * ITEMS_PER_PAGE;
  const pageRows = filtered.slice(start, start + ITEMS_PER_PAGE);
  const table = createTable([
    {
      label: 'MÃ LINH KIỆN',
      render: (stock) => {
        const cell = element('div', 'part-cell');
        cell.append(element('span', 'part-icon', '▧'));
        const name = element('span');
        name.append(element('strong', '', stock.partCode), element('small', '', stock.partName));
        cell.append(name);
        return cell;
      }
    },
    { label: 'ĐƠN GIÁ (Đ)', render: (stock) => formatCurrency(stock.unitPrice) },
    { label: 'TỒN', render: (stock) => element('span', stock.currentStock === 0 ? 'quantity is-empty' : 'quantity', String(stock.currentStock)) },
    { label: 'NGƯỠNG', render: (stock) => element('span', 'threshold', String(stock.minThreshold)) },
    {
      label: 'TRẠNG THÁI',
      render: (stock) => createPill(
        stock.currentStock === 0 ? 'Hết hàng' : stock.currentStock < stock.minThreshold ? 'Dưới ngưỡng' : 'Đủ',
        stock.currentStock === 0 ? 'empty' : stock.currentStock < stock.minThreshold ? 'warning' : 'success'
      )
    },
    {
      label: 'THAO TÁC',
      render: (stock) => {
        const exportButton = iconButton('Xuất', 'text-button', () => {
          pendingIssuePartId = stock.partId;
          openIssue();
        });
        exportButton.disabled = stock.currentStock === 0;
        exportButton.title = stock.currentStock === 0 ? 'Linh kiện đã hết hàng' : 'Xuất linh kiện cho phiếu bảo hành';
        return exportButton;
      }
    }
  ], pageRows, 'Thử tìm theo mã hoặc tên, hoặc xóa bộ lọc để xem lại danh sách.');

  const pagination = createPagination(inventoryPage, filtered.length, (page) => {
    inventoryPage = page;
    openInventory();
  }, 'linh kiện');
  container.replaceChildren(heading, warning, toolbar, metrics, table, pagination);
}

async function openIssue() {
  setView('issue');
  clearNotice();
  app.replaceChildren();
  const content = element('div');
  app.append(content);

  showState(content, async () => {
    const centers = await listCenters();
    selectedCenter = selectedCenter || centers[0]?.center_id || '';
    const stocks = await listStocks();
    return { centers, stocks };
  }, ({ centers, stocks }) => renderIssue(content, centers, stocks), 'Cần có trung tâm và tồn kho để xuất linh kiện.');
}

function renderIssue(container, centers, stocks) {
  setActiveCenter(selectedCenter, centers);
  const heading = setPageHeading('Xuất linh kiện cho phiếu bảo hành', 'Chọn phiếu, linh kiện và số lượng cần cấp.', [
    iconButton('Quay lại tồn kho', 'button button-secondary', openInventory)
  ]);
  const centerSelect = createCenterSelect(centers);
  const ticketInput = element('input', 'text-control');
  ticketInput.type = 'number';
  ticketInput.min = '1';
  ticketInput.step = '1';
  ticketInput.required = true;
  ticketInput.placeholder = 'Nhập mã phiếu';
  ticketInput.setAttribute('aria-label', 'Mã phiếu bảo hành');

  const partSelect = element('select', 'select-control');
  partSelect.required = true;
  const quantityInput = element('input', 'text-control');
  quantityInput.type = 'number';
  quantityInput.min = '1';
  quantityInput.step = '1';
  quantityInput.required = true;
  quantityInput.value = '1';
  quantityInput.setAttribute('aria-label', 'Số lượng xuất');

  const summary = element('div', 'selected-part-summary');
  const formNotice = element('div', 'inline-message is-info');
  formNotice.append(element('strong', '', 'Lưu ý về phiếu bảo hành'), element('span', '', 'Backend hiện chưa có API phiếu bảo hành. Mã phiếu được kiểm tra định dạng số và lưu làm tham chiếu; chưa xác minh trạng thái hoặc trung tâm của phiếu.'));
  const feedback = element('div', 'inline-message');
  feedback.hidden = true;
  const form = element('form', 'workflow-form');
  const ticketHistory = element('section', 'workflow-card ticket-history');
  const ticketHistoryContent = element('div');
  ticketHistory.append(element('h3', '', 'Giao dịch đã xuất cho mã phiếu'), ticketHistoryContent);
  showDataState(ticketHistoryContent, { empty: 'Nhập mã phiếu để tra cứu các giao dịch đã ghi nhận.' });
  const sections = element('div', 'workflow-grid');
  const ticketSection = element('section', 'workflow-card');
  ticketSection.append(
    element('span', 'step-number', '1'),
    element('h3', '', 'Phiếu bảo hành'),
    element('p', 'muted', 'Nhập mã phiếu để gắn giao dịch xuất linh kiện.')
  );
  const ticketLabel = element('label', 'field');
  ticketLabel.append(element('span', 'field-label', 'Mã phiếu bảo hành'), ticketInput);
  ticketSection.append(ticketLabel, formNotice);

  const issueSection = element('section', 'workflow-card');
  issueSection.append(
    element('span', 'step-number', '2'),
    element('h3', '', 'Linh kiện và số lượng'),
    element('p', 'muted', 'Tồn kho được kiểm tra lại tại thời điểm ghi giao dịch.')
  );
  const centerLabel = element('label', 'field');
  centerLabel.append(element('span', 'field-label', 'Trung tâm dịch vụ'), centerSelect);
  const partLabel = element('label', 'field');
  partLabel.append(element('span', 'field-label', 'Linh kiện'), partSelect);
  const quantityLabel = element('label', 'field');
  quantityLabel.append(element('span', 'field-label', 'Số lượng xuất'), quantityInput);
  issueSection.append(centerLabel, partLabel, quantityLabel, summary);
  sections.append(ticketSection, issueSection);

  const footer = element('div', 'workflow-footer');
  footer.append(feedback, iconButton('Xuất linh kiện', 'button button-primary', () => {}));
  const submit = footer.querySelector('button');
  submit.type = 'submit';
  form.append(sections, footer);

  function updatePartOptions() {
    selectedCenter = centerSelect.value;
    setActiveCenter(centerSelect.value, centers);
    const centerStocks = stocks.filter((stock) => Number(stock.centerId) === Number(centerSelect.value));
    partSelect.replaceChildren();
    centerStocks.forEach((stock) => {
      const option = element('option', '', `${stock.partCode} · ${stock.partName}`);
      option.value = stock.partId;
      partSelect.append(option);
    });
    if (pendingIssuePartId && centerStocks.some((stock) => Number(stock.partId) === Number(pendingIssuePartId))) {
      partSelect.value = pendingIssuePartId;
    }
    if (!centerStocks.length) {
      partSelect.disabled = true;
      submit.disabled = true;
      summary.textContent = 'Trung tâm này chưa có linh kiện trong danh sách tồn.';
      return;
    }
    partSelect.disabled = false;
    updateSelectedPart();
    loadTicketHistory();
  }

  function loadTicketHistory() {
    const ticketId = ticketInput.value.trim();
    if (!ticketId) {
      showDataState(ticketHistoryContent, { empty: 'Nhập mã phiếu để tra cứu các giao dịch đã ghi nhận.' });
      return;
    }
    showState(ticketHistoryContent, () => listTransactions(centerSelect.value, 'OUT'), (result) => {
      const reference = `TICKET-${ticketId}`;
      const transactions = (result.items || []).filter((item) => item.ticket_code === reference
        || item.ticket_code?.startsWith(`${reference}:`));
      if (!transactions.length) {
        showDataState(ticketHistoryContent, { empty: 'Chưa có giao dịch xuất nào được ghi nhận với mã tham chiếu này.' });
        return;
      }
      ticketHistoryContent.replaceChildren(createTable([
        {
          label: 'LINH KIỆN',
          render: (item) => {
            const stock = stocks.find((part) => Number(part.centerId) === Number(item.center_id)
              && Number(part.partId) === Number(item.part_id));
            return stock ? `${stock.partCode} · ${stock.partName}` : `#${item.part_id}`;
          }
        },
        { label: 'SỐ LƯỢNG', render: (item) => String(item.quantity) },
        { label: 'THỜI ĐIỂM XUẤT', render: (item) => formatDate(item.created_at) },
        { label: 'MÃ THAM CHIẾU', render: (item) => item.ticket_code }
      ], transactions, 'Chưa có giao dịch xuất nào cho mã này.'));
    }, 'Không thể tải các giao dịch đã ghi nhận.');
  }

  function updateSelectedPart() {
    const selected = stocks.find((stock) => Number(stock.centerId) === Number(centerSelect.value)
      && Number(stock.partId) === Number(partSelect.value));
    if (!selected) return;
    const stockStatus = selected.currentStock === 0
      ? 'Hết hàng'
      : selected.currentStock < selected.minThreshold
        ? 'Dưới ngưỡng'
        : 'Đủ';
    summary.replaceChildren(
      element('span', 'stock-summary-main', `Tồn hiện tại: ${selected.currentStock} · Ngưỡng: ${selected.minThreshold}`),
      element('span', 'stock-summary-price', `Đơn giá: ${formatCurrency(selected.unitPrice)}`),
      createPill(stockStatus, selected.currentStock === 0 ? 'empty' : selected.currentStock < selected.minThreshold ? 'warning' : 'success')
    );
    submit.disabled = selected.currentStock === 0;
    submit.title = selected.currentStock === 0 ? 'Không thể xuất linh kiện đã hết hàng' : '';
    const line = element('div', selected.currentStock < selected.minThreshold ? 'inline-message is-warning' : 'inline-message is-info');
    line.textContent = selected.currentStock === 0
      ? 'Không thể xuất: linh kiện đã hết hàng.'
      : selected.currentStock < selected.minThreshold
        ? `Lưu ý: tồn còn ${selected.currentStock}, dưới ngưỡng ${selected.minThreshold}.`
        : '';
    summary.append(line);
  }

  centerSelect.addEventListener('change', updatePartOptions);
  partSelect.addEventListener('change', updateSelectedPart);
  ticketInput.addEventListener('change', loadTicketHistory);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Đang ghi nhận…';
    try {
      const result = await issueStock({
        centerId: Number(centerSelect.value),
        partId: Number(partSelect.value),
        ticketId: Number(ticketInput.value),
        quantity: Number(quantityInput.value)
      });
      pendingIssuePartId = null;
      await openInventory();
      showNotice(`Đã xuất ${result.quantity} linh kiện. Tồn còn lại: ${result.currentStock}.`);
    } catch (error) {
      feedback.className = `inline-message ${error.code === 'INSUFFICIENT_STOCK' ? 'is-warning' : 'is-error'}`;
      feedback.textContent = error.message;
      feedback.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Xuất linh kiện';
    }
  });

  updatePartOptions();
  container.replaceChildren(heading, form, ticketHistory);
}

async function openWarehouse() {
  setView('warehouse');
  clearNotice();
  app.replaceChildren();
  const content = element('div');
  app.append(content);
  showState(content, async () => {
    const centers = await listCenters();
    selectedCenter = selectedCenter || centers[0]?.center_id || '';
    const stocks = await listStocks();
    return { centers, stocks };
  }, ({ centers, stocks }) => renderWarehouse(content, centers, stocks), 'Không tải được trung tâm hoặc danh mục linh kiện.');
}

function renderWarehouse(container, centers, stocks) {
  setActiveCenter(selectedCenter || centers[0]?.center_id, centers);
  const heading = setPageHeading('Nhập kho và lịch sử giao dịch', 'Ghi nhận nhập kho và theo dõi lịch sử thay đổi tồn.');
  const receiptSection = element('section', 'warehouse-section');
  receiptSection.append(element('h3', '', 'Ghi nhận nhập kho'));
  renderReceipt(receiptSection, centers, stocks);

  const historySection = element('section', 'warehouse-section');
  historySection.append(element('h3', '', 'Lịch sử giao dịch kho'));
  renderHistory(historySection, centers, stocks);
  container.replaceChildren(heading, receiptSection, historySection);
}

function renderReceipt(container, centers, stocks) {
  const form = element('form', 'receipt-form');
  const centerSelect = createCenterSelect(centers);
  const partSelect = element('select', 'select-control');
  partSelect.required = true;
  const quantity = element('input', 'text-control');
  quantity.type = 'number';
  quantity.min = '1';
  quantity.step = '1';
  quantity.required = true;
  quantity.setAttribute('aria-label', 'Số lượng nhập');
  quantity.value = '1';
  const note = element('input', 'text-control');
  note.type = 'text';
  note.maxLength = 200;
  note.placeholder = 'Ví dụ: Nhập từ NCC, lô tháng 10';
  note.setAttribute('aria-label', 'Ghi chú');
  const feedback = element('div', 'inline-message');
  feedback.hidden = true;
  const submit = iconButton('Ghi nhận nhập kho', 'button button-primary', () => {});
  submit.type = 'submit';

  const centerLabel = element('label', 'field');
  centerLabel.append(element('span', 'field-label', 'Trung tâm dịch vụ'), centerSelect);
  const partLabel = element('label', 'field');
  partLabel.append(element('span', 'field-label', 'Linh kiện'), partSelect);
  const quantityLabel = element('label', 'field');
  quantityLabel.append(element('span', 'field-label', 'Số lượng nhập'), quantity);
  const noteLabel = element('label', 'field');
  noteLabel.append(element('span', 'field-label', 'Ghi chú (tùy chọn)'), note);
  const managerHint = element('div', 'inline-message is-info', 'Phân quyền Quản lý trung tâm chưa được triển khai trong backend.');

  function updatePartOptions() {
    selectedCenter = centerSelect.value;
    setActiveCenter(selectedCenter, centers);
    const centerItems = stocks.filter((stock) => Number(stock.centerId) === Number(centerSelect.value));
    partSelect.replaceChildren();
    centerItems.forEach((stock) => {
      const option = element('option', '', `${stock.partCode} · ${stock.partName}`);
      option.value = stock.partId;
      partSelect.append(option);
    });
    partSelect.disabled = centerItems.length === 0;
    submit.disabled = centerItems.length === 0;
  }

  centerSelect.addEventListener('change', updatePartOptions);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.hidden = true;
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = 'Đang ghi nhận…';
    try {
      const result = await receiveStock({
        centerId: Number(centerSelect.value),
        partId: Number(partSelect.value),
        quantity: Number(quantity.value),
        note: note.value.trim()
      });
      quantity.value = '1';
      note.value = '';
      await openWarehouse();
      showNotice(`Đã nhập ${result.quantity} linh kiện. Tồn mới: ${result.currentStock}.`);
    } catch (error) {
      feedback.className = 'inline-message is-error';
      feedback.textContent = error.message;
      feedback.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Ghi nhận nhập kho';
    }
  });
  updatePartOptions();
  form.append(centerLabel, partLabel, quantityLabel, noteLabel, managerHint, feedback, submit);
  container.append(form);
}

function renderHistory(container, centers, stocks) {
  const toolbar = element('form', 'history-filters');
  const type = createFilterSelect('Loại giao dịch', [
    ['', 'Tất cả'],
    ['IN', 'Nhập kho'],
    ['OUT', 'Xuất kho']
  ], transactionFilters.type);
  const uniqueParts = [...new Map(stocks.map((stock) => [String(stock.partId), stock])).values()];
  const part = createFilterSelect('Linh kiện', [
    ['', 'Tất cả linh kiện'],
    ...uniqueParts.map((stock) => [String(stock.partId), `${stock.partCode} · ${stock.partName}`])
  ], transactionFilters.partId);
  const from = createDateFilter('Từ ngày', transactionFilters.from);
  const to = createDateFilter('Đến ngày', transactionFilters.to);
  const apply = iconButton('Lọc giao dịch', 'button button-primary', () => {});
  apply.type = 'submit';
  toolbar.append(type.wrapper, part.wrapper, from.wrapper, to.wrapper, apply);
  toolbar.addEventListener('submit', async (event) => {
    event.preventDefault();
    transactionFilters = {
      type: type.input.value,
      partId: part.input.value,
      from: from.input.value,
      to: to.input.value
    };
    transactionPage = 1;
    await openWarehouse();
  });

  const reset = iconButton('Đặt lại bộ lọc', 'text-button', async () => {
    transactionFilters = { type: '', partId: '', from: '', to: '' };
    transactionPage = 1;
    await openWarehouse();
  });
  const results = element('div');
  container.append(toolbar, reset, results);

  showState(results, () => listTransactions(selectedCenter || null), (result) => {
    const filtered = (result.items || []).filter((transaction) => {
      if (transactionFilters.type && transaction.transaction_type !== transactionFilters.type) return false;
      if (transactionFilters.partId && String(transaction.part_id) !== transactionFilters.partId) return false;
      const date = transaction.created_at.slice(0, 10);
      if (transactionFilters.from && date < transactionFilters.from) return false;
      if (transactionFilters.to && date > transactionFilters.to) return false;
      return true;
    });

    if (filtered.length === 0) {
      const empty = element('div', 'data-state');
      empty.append(element('strong', '', 'Không có giao dịch nào trong khoảng đã chọn.'));
      empty.append(reset);
      results.replaceChildren(empty);
      return;
    }

    const start = (transactionPage - 1) * ITEMS_PER_PAGE;
    const rows = filtered.slice(start, start + ITEMS_PER_PAGE);
    const table = createTable([
      { label: 'THỜI ĐIỂM', render: (transaction) => formatDate(transaction.created_at) },
      { label: 'LOẠI', render: (transaction) => createPill(transaction.transaction_type === 'IN' ? 'Nhập' : 'Xuất', transaction.transaction_type === 'IN' ? 'success' : 'info') },
      {
        label: 'MÃ LINH KIỆN',
        render: (transaction) => {
          const stock = stocks.find((item) => Number(item.partId) === Number(transaction.part_id));
          return stock ? `${stock.partCode} · ${stock.partName}` : `#${transaction.part_id}`;
        }
      },
      { label: 'SỐ LƯỢNG', render: (transaction) => String(transaction.quantity) },
      { label: 'PHIẾU BẢO HÀNH / GHI CHÚ', render: (transaction) => transaction.ticket_code || '—' }
    ], rows, '');
    results.replaceChildren(table, createPagination(transactionPage, filtered.length, (page) => {
      transactionPage = page;
      openWarehouse();
    }, 'giao dịch'));
  }, 'Chưa có giao dịch kho nào.');
}

function createFilterSelect(labelText, options, value) {
  const wrapper = element('label', 'filter-group');
  wrapper.append(element('span', 'filter-label', labelText));
  const input = element('select', 'select-control');
  options.forEach(([optionValue, label]) => {
    const option = element('option', '', label);
    option.value = optionValue;
    input.append(option);
  });
  input.value = value;
  wrapper.append(input);
  return { wrapper, input };
}

function createDateFilter(labelText, value) {
  const wrapper = element('label', 'filter-group');
  wrapper.append(element('span', 'filter-label', labelText));
  const input = element('input', 'text-control');
  input.type = 'date';
  input.value = value;
  wrapper.append(input);
  return { wrapper, input };
}

async function openDetail(centerId, partId) {
  clearNotice();
  setView('inventory');
  app.replaceChildren();
  const content = element('div');
  app.append(content);
  showState(content, () => getStock(centerId, partId), (stock) => {
    const heading = setPageHeading(stock.partName, `${stock.partCode} · Chi tiết tồn kho`, [
      iconButton('Quay lại tồn kho', 'button button-secondary', openInventory)
    ]);
    const card = element('article', 'detail-card');
    card.append(element('h3', '', stock.partName));
    card.append(element('p', 'muted', stock.partCode));
    card.append(element('p', '', `Tồn hiện tại: ${stock.currentStock} · Ngưỡng: ${stock.minThreshold}`));
    card.append(element('p', '', `Đơn giá: ${formatCurrency(stock.unitPrice)}`));
    content.replaceChildren(heading, card);
  }, 'Không tìm thấy tồn kho cho linh kiện đã chọn.');
}

document.querySelectorAll('[data-view]').forEach((item) => {
  item.addEventListener('click', () => {
    if (item.dataset.view === 'inventory') openInventory();
    if (item.dataset.view === 'issue') openIssue();
    if (item.dataset.view === 'warehouse') openWarehouse('receipt');
  });
});

document.querySelector('#logout-button').addEventListener('click', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('username');
  showLoginScreen();
});

window.addEventListener('smartcrm:unauthorized', () => showLoginScreen('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));

window.addEventListener('unhandledrejection', (event) => {
  showNotice(event.reason?.message || 'Đã xảy ra lỗi không xác định.', 'error');
});

const existingToken = window.localStorage.getItem('token');
if (existingToken) {
  setAuthenticatedUI(window.localStorage.getItem('username'));
  openInventory();
} else {
  showLoginScreen();
}
