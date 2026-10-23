export function showDataState(container, { loading = false, error = null, empty = null, onRetry } = {}) {
  if (!loading && !error && !empty) return false;

  const state = document.createElement('div');
  state.className = `data-state${error ? ' is-error' : ''}`;
  state.setAttribute(error ? 'role' : 'status', error ? 'alert' : 'status');

  const title = document.createElement('strong');
  title.textContent = loading ? 'Đang tải dữ liệu' : error ? 'Không thể tải dữ liệu' : 'Chưa có dữ liệu';
  state.append(title);

  const description = document.createElement('p');
  description.textContent = loading
    ? 'Vui lòng đợi trong giây lát.'
    : error
      ? error.message
      : empty;
  state.append(description);

  if (error && onRetry) {
    const retry = document.createElement('button');
    retry.className = 'button button-secondary';
    retry.type = 'button';
    retry.textContent = 'Thử lại';
    retry.addEventListener('click', onRetry);
    state.append(retry);
  }

  container.replaceChildren(state);
  return true;
}
