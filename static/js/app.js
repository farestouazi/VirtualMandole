(function() {
    const root = document.documentElement;
    const fretboard = document.querySelector('.fretboard');
    const instrumentSelector = document.querySelector('#instrument-selector');
    const accidentalSelector = document.querySelector('.accidental-selector');
    const showAllNotesSelector = document.querySelector('#show-all-notes');

    const notesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const instrumentTuningPresets = {
        'Mandole (10 cordes)': [0, 7, 2, 9, 4],
        'Mandole Chaib WChbab (10 cordes)': [0, 7, 2, 9, 4],
        'Mandole Chaabi (8 cordes)': [7, 2, 9, 4],
    };

    let allNotes = document.querySelectorAll('.note-fret');
    let showAllNotes = false;
    let accidentals = 'flats';
    let selectedInstrument = 'Mandole (10 cordes)';

    const app = {
        init() {
            this.setupInstrumentSelector();
            handlers.setupEventListeners();
            this.updateNotes();
        },

        setupInstrumentSelector() {
            instrumentSelector.innerHTML = '';
            for (let instrument in instrumentTuningPresets) {
                const option = document.createElement('option');
                option.textContent = instrument;
                if (instrument === selectedInstrument) option.selected = true;
                instrumentSelector.appendChild(option);
            }
        },

        updateNotes() {
            allNotes.forEach((noteFret, i) => {
                const stringElement = noteFret.closest('.string');
                const stringIndex = Array.from(fretboard.children).indexOf(stringElement);
                const fretIndex = Array.from(stringElement.children).indexOf(noteFret);
                const noteValue = fretIndex + instrumentTuningPresets[selectedInstrument][stringIndex];
                const noteName = accidentals === 'flats' ? notesFlat[noteValue % 12] : notesSharp[noteValue % 12];
                noteFret.setAttribute('data-note', noteName);
            });
        },


    };

    const handlers = {
        showNoteDot(event) {
            if (showAllNotes) return;
            
            if (event.target.classList.contains('note-fret')) {
                event.target.style.setProperty('--noteDotOpacity', 1);
                
            }
        },
        hideNoteDot(event) {
            if (showAllNotes) return;
            if (event.target.classList.contains('note-fret')) {
                event.target.style.setProperty('--noteDotOpacity', 0);
            }
        },
        setSelectedInstrument(event) {
            selectedInstrument = event.target.value;
            app.updateNotes();
        },
        setAccidentals(event) {
            if (!event.target.classList.contains('acc-select')) return;
            accidentals = event.target.value;
            app.updateNotes();
            app.setupNoteNameSection();
        },
        setShowAllNotes() {
            showAllNotes = showAllNotesSelector.checked;
            const opacity = showAllNotes ? 1 : 0;
            allNotes.forEach(note => note.style.setProperty('--noteDotOpacity', opacity));
        },
        setupEventListeners() {
            fretboard.addEventListener('mouseover', this.showNoteDot);
            fretboard.addEventListener('mouseout', this.hideNoteDot);
            instrumentSelector.addEventListener('change', this.setSelectedInstrument);
            accidentalSelector.addEventListener('click', this.setAccidentals);
            showAllNotesSelector.addEventListener('change', this.setShowAllNotes);
        }
    };

    app.init();
})();
