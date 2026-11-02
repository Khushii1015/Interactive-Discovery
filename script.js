const STORAGE_KEY = 'case017-rebuilt-v1'; // localStorage key for saved progress
const CLUES = ['photo', 'messages', 'log', 'map']; // The four collectable clues
const ENDINGS = { // Each ending's number, name, and story, keyed by the id saved in state.endings
  rescue: { number: 1, name: 'THE WITNESS', story: 'You publish the evidence and include the maintenance tunnel coordinates. Investigators find Mara alive in a safehouse beyond the tunnel. She had staged her disappearance to protect the files.' },
  exposure: { number: 2, name: 'THE LEAK', story: 'The documents go public. Blackwood is investigated, but without the tunnel route no one can locate Mara. A message arrives: “You told the truth. Now find me.”' },
  silence: { number: 3, name: 'THE SHADOW', story: 'You hide the files and send a warning through the recovered contact. Days later, the laptop receives one final message: “I made it out. Thank you.” Mara remains invisible.' },
};

const blankState = () => ({ started: false, photo: false, messages: false, log: false, map: false, unlocked: false, endings: [] }); // Returns fresh progress for a new case
const byId = id => document.getElementById(id); // Shorthand for document.getElementById

let state = loadState();
let currentView = '';
let lastFocus = null;
let revealTimer = null;
let toastTimer = null;

function loadState() { // Restores saved progress, or starts a new case if the save is missing or corrupt
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...blankState(), ...saved, endings: Array.isArray(saved.endings) ? saved.endings : [] };
  } catch (error) {
    console.warn('Saved progress was invalid; starting a new case.', error);
    return blankState();
  }
}

function save() { // Stores progress in localStorage and refreshes the on-screen counters
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { console.warn('Could not save progress.', error); }
  updateStatus();
}

function updateStatus() { // Updates the clue, ending, and vault labels on the desktop and status bar
  const clues = CLUES.filter(clue => state[clue]).length;
  byId('status').textContent = `${clues} / 4 CLUES · ${state.endings.length} / 3 ENDINGS`;
  byId('clue-label').textContent = `${clues} / 4 CLUES`;
  byId('vault-label').textContent = state.unlocked ? 'DECRYPTED' : 'LOCKED';
}

function notify(text) { // Shows a toast message that hides itself after 2.4 seconds
  const toast = byId('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2400);
}

function showDesktop(visible) { // Switches between the intro screen and the investigation desktop
  byId('intro').classList.toggle('hidden', visible);
  byId('desktop').classList.toggle('hidden', !visible);
}

function begin() { // Marks the case as started and opens the desktop
  state.started = true;
  save();
  showDesktop(true);
}

function restart() { // Erases all progress after confirmation and returns to the intro
  if (!confirm('Erase all evidence and discovered endings?')) return;
  state = blankState();
  save();
  closePanel();
  showDesktop(false);
  byId('begin').focus();
}

function render(template, slots = {}) { // Clones an HTML template and fills in everything that depends on progress
  const view = template.content.cloneNode(true);
  view.querySelectorAll('[data-if]').forEach(el => { if (!state[el.dataset.if]) el.remove(); });
  view.querySelectorAll('[data-unless]').forEach(el => { if (state[el.dataset.unless]) el.remove(); });
  view.querySelectorAll('[data-reveal]').forEach(el => el.classList.toggle('hidden', !state[el.dataset.reveal]));
  view.querySelectorAll('[data-check]').forEach(el => { el.textContent = `${state[el.dataset.check] ? '✓' : '○'} ${el.textContent}`; });
  view.querySelectorAll('[data-done]').forEach(el => { if (state[el.dataset.clue]) el.textContent = el.dataset.done; });
  view.querySelectorAll('[data-fill]').forEach(el => { el.textContent = el.textContent.replace(/{(\w+)}/g, (_, key) => slots[key]); });
  return view;
}

function openPanel(view) { // Renders a view into the dialog, opens it, and starts the hidden-log reveal when due
  clearTimeout(revealTimer);
  lastFocus = document.activeElement;
  currentView = view;
  const template = byId(view === 'vault' && state.unlocked ? 'view-vault-open' : `view-${view}`);
  const endingNames = state.endings.map(id => ENDINGS[id].name).join(' / ') || 'NO ENDINGS RECORDED';
  byId('panel-title').textContent = template.dataset.title;
  byId('panel-content').replaceChildren(render(template, { endingCount: state.endings.length, endingNames }));
  byId('panel').classList.remove('hidden');
  byId('close').focus();
  if (view === 'logs' && state.photo && !state.log) revealTimer = setTimeout(revealLog, 2600);
}

function closePanel() { // Hides the dialog, cancels any pending reveal, and returns focus to where it was
  clearTimeout(revealTimer);
  byId('panel').classList.add('hidden');
  currentView = '';
  if (lastFocus?.isConnected) lastFocus.focus();
}

function revealLog() { // Uncovers the hidden access-log entry
  byId('delayed-log').classList.remove('hidden');
  notify('RECOVERED ENTRY DECRYPTED');
}

function collect(clue, message) { // Saves a clue, re-renders the open view to show it, and confirms with a toast
  state[clue] = true;
  save();
  openPanel(currentView);
  notify(message);
}

function unlock() { // Checks the decryption key and opens the final recording when it is correct
  const error = byId('error');
  if (!state.photo || !state.messages || !state.log) error.textContent = 'ACCESS DENIED: THREE REQUIRED RECORDS MISSING.';
  else if (byId('key').value.trim().toUpperCase() !== 'B04RAVEN') error.textContent = 'INCORRECT KEY. RECHECK THE DOOR AND BIRD CLUES.';
  else {
    state.unlocked = true;
    save();
    openPanel('ending');
    notify('DECRYPTION COMPLETE');
  }
}

function playSignal() { // Plays the recovered audio from the start, or warns if the device can't play it
  const audio = byId('signal');
  audio.currentTime = 0;
  audio.play().catch(() => notify('AUDIO UNAVAILABLE ON THIS DEVICE'));
}

function finish(choice) { // Picks one of three endings from the player's choice and whether the map was found
  const id = choice === 'hide' ? 'silence' : state.map ? 'rescue' : 'exposure';
  if (!state.endings.includes(id)) state.endings.push(id);
  save();
  const { number, name, story } = ENDINGS[id];
  byId('result').replaceChildren(render(byId('ending-result'), { title: `ENDING ${number}: ${name}`, story, count: state.endings.length }));
}

function trapFocus(event) { // Wraps Tab and Shift+Tab between the first and last controls in the dialog
  const focusable = [...byId('panel').querySelectorAll('button:not([disabled]),input')];
  const [edge, wrapTo] = event.shiftKey ? [focusable[0], focusable.at(-1)] : [focusable.at(-1), focusable[0]];
  if (document.activeElement !== edge) return;
  event.preventDefault();
  wrapTo.focus();
}

const actions = { // Button behaviours, keyed by each button's data-action value
  collect: ({ dataset }) => collect(dataset.clue, dataset.message),
  toast: ({ dataset }) => notify(dataset.message),
  finish: ({ dataset }) => finish(dataset.choice),
  unlock,
  audio: playSignal,
};

document.addEventListener('click', ({ target }) => { // Routes clicks from any data-open or data-action button, including ones rendered later
  const button = target.closest('[data-open], [data-action]');
  if (button?.dataset.open) openPanel(button.dataset.open);
  else if (button) actions[button.dataset.action](button);
});

document.addEventListener('keydown', event => { // Closes the dialog on Escape and keeps Tab focus inside it
  if (byId('panel').classList.contains('hidden')) return;
  if (event.key === 'Escape') closePanel();
  if (event.key === 'Tab') trapFocus(event);
});

function updateClock() { // Shows the current hour and minute in the system bar
  byId('clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

byId('begin').addEventListener('click', begin);
byId('close').addEventListener('click', closePanel);
byId('restart').addEventListener('click', restart);
updateClock();
setInterval(updateClock, 30000);
updateStatus();
if (state.started) begin();