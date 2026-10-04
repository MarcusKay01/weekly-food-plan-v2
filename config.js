export const SUPABASE_URL = 'https://tskihefmcsqcdvjvzdwm.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AL_R6WjOMKyeWltHOth9yg_pGLg3rWD';

// Mobile drag enhancement. Kept outside the authentication/app bootstrap so
// interaction changes cannot interfere with sign-in.
function addDragGrips() {
  document.querySelectorAll('.meal[data-draggable="true"]').forEach(meal => {
    if (meal.querySelector('.drag-grip')) return;
    const row = meal.querySelector('.row');
    if (!row) return;
    const grip = document.createElement('span');
    grip.className = 'drag-grip';
    grip.setAttribute('role', 'button');
    grip.setAttribute('aria-label', 'Drag meal to another day');
    grip.title = 'Drag meal';
    grip.textContent = '⠿';
    Object.assign(grip.style, {
      display: 'grid',
      placeItems: 'center',
      width: '34px',
      height: '40px',
      minWidth: '34px',
      marginLeft: '2px',
      borderRadius: '10px',
      color: '#6a736e',
      fontSize: '22px',
      lineHeight: '1',
      cursor: 'grab',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none'
    });
    row.appendChild(grip);
  });
}

const dragGripObserver = new MutationObserver(addDragGrips);
function startDragGripEnhancement() {
  addDragGrips();
  const week = document.getElementById('week');
  if (week) dragGripObserver.observe(week, { childList: true, subtree: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startDragGripEnhancement, { once: true });
} else {
  startDragGripEnhancement();
}
