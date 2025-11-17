(function () {
    const root = document.documentElement;
    const fretboard = document.querySelector('.fretboard');
    const instrumentSelector = document.querySelector('#instrument-selector');
    const accidentalSelector = document.querySelector('.accidental-selector');
    const showAllNotesSelector = document.querySelector('#show-all-notes');

    const notesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const notesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const instruments = {
        "Mandole Simple (10 cordes)": {
            strings: 5,
            splitFrets: [2, 4],
            uniformStrings: false,
            eightStrings: false
        },

        "Mandole Chaib WChbab (10 cordes)": {
            strings: 5,
            splitFrets: [2, 4, 6],
            uniformStrings: true,
            eightStrings: false
        },

        "Mandole Chaabi (8 cordes)": {
            strings: 4,
            splitFrets: [],
            uniformStrings: false,
            eightStrings: true
        }
    };


    const instrumentTuningPresets = {
        'Mandole Simple (10 cordes)': [0, 7, 2, 9, 4],
        'Mandole Chaib WChbab (10 cordes)': [0, 7, 2, 9, 4],
        'Mandole Chaabi (8 cordes)': [7, 2, 9, 4],
    };

    const tuningMidi = {
        "Mandole Simple (10 cordes)": [60, 55, 50, 45, 40],
        "Mandole Chaib WChbab (10 cordes)": [60, 55, 50, 45, 40],
        "Mandole Chaabi (8 cordes)": [55, 50, 45, 40],
    };




    let allNotes = document.querySelectorAll('.note-fret');
    let showAllNotes = false;
    let accidentals = 'flats';
    let transpose = 0;
    let selectedInstrument = "Mandole Simple (10 cordes)";


    function buildFretboard() {
        const fb = document.querySelector(".fretboard");
        fb.innerHTML = "";

        const config = instruments[selectedInstrument];
        const FRETS = 13;

        for (let s = 0; s < config.strings; s++) {

            let stringIndex = s;

            if (selectedInstrument === "Mandole Chaabi (8 cordes)") {
                stringIndex = s - 1;
            }

            const string = document.createElement("div");
            string.className = "string";
            string.dataset.stringIndex = stringIndex;

            for (let f = 0; f < FRETS; f++) {
                const fret = document.createElement("div");
                fret.className = "note-fret";

                // Split frets
                if (config.splitFrets.includes(f)) {
                    fret.classList.add("split");

                    const halfLeft = document.createElement("div");
                    halfLeft.className = "half-left";

                    const halfRight = document.createElement("div");
                    halfRight.className = "half-right";

                    fret.appendChild(halfLeft);
                    fret.appendChild(halfRight);
                }

                // Fret markers (same positions you used)
                if ([3, 5, 7, 9, 12].includes(f) && s === 0) {
                    fret.classList.add("single-fretmark");
                }

                string.appendChild(fret);
            }

            fb.appendChild(string);
        }
    }



    function updateStringStyle() {
        const fb = document.querySelector(".fretboard");
        fb.classList.remove("uniform-strings");
        fb.classList.remove("eight-strings");

        if (instruments[selectedInstrument].uniformStrings) {
            fb.classList.add("uniform-strings");
        }

        if (instruments[selectedInstrument].eightStrings) {
            fb.classList.add("eight-strings");
        }
    }






    function noteToFrequency(note) {
        const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

        // Extract base note + octave (supports _k)
        const match = note.match(/^([A-G][b#]?)(?:_k)?(\d)$/);
        if (!match) return 440;

        let [, baseNote, octave] = match;
        octave = parseInt(octave);

        // Convert flats to sharps
        const flatToSharp = {
            "Db": "C#",
            "Eb": "D#",
            "Gb": "F#",
            "Ab": "G#",
            "Bb": "A#"
        };
        if (flatToSharp[baseNote]) baseNote = flatToSharp[baseNote];

        const noteIndex = notes.indexOf(baseNote);
        if (noteIndex === -1) return 440;

        // Calculate final frequency
        const a4 = 440;
        const midi = noteIndex + (octave + 1) * 12; // proper midi
        const midiA4 = 69;

        return a4 * Math.pow(2, (midi - midiA4) / 12);
    }


    function playNote(noteElement) {
        let midi = parseFloat(noteElement.dataset.midi);

        midi += transpose;

        const freq = 440 * Math.pow(2, (midi - 69) / 12);

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }




    function createSplitFrets() {
        document.querySelectorAll('.string').forEach(string => {
            const frets = string.querySelectorAll('.note-fret');

            [2, 4].forEach(index => {
                const fret = frets[index];
                if (!fret) return;

                fret.classList.add('split');

                if (!fret.querySelector('.half-left')) {
                    const left = document.createElement('div');
                    left.className = 'half-left';
                    fret.appendChild(left);
                }

                if (!fret.querySelector('.half-right')) {
                    const right = document.createElement('div');
                    right.className = 'half-right';
                    fret.appendChild(right);
                }
            });
        });
    }

    function updateNotes() {
        const tunings = tuningMidi[selectedInstrument];

        document.querySelectorAll('.string').forEach((string, sIndex) => {
            const openMidi = tunings[sIndex];
            const frets = string.querySelectorAll('.note-fret');

            frets.forEach((fret, fIndex) => {
                const midi = openMidi + fIndex; // each fret adds 1 semitone
                const noteName = midiToNote(midi);

                fret.dataset.midi = midi;
                fret.dataset.note = noteName;

                if (fret.classList.contains("split")) {
                    const left = fret.querySelector(".half-left");
                    const right = fret.querySelector(".half-right");

                    left.dataset.midi = midi - 0.6; // special note (quarter-tone lower)
                    left.dataset.note = noteName + "_k";

                    right.dataset.midi = midi;
                    right.dataset.note = noteName;
                }
            });
        });
    }



    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }



    function setupInstrumentSelector() {
        instrumentSelector.innerHTML = '';
        for (let instrument in instrumentTuningPresets) {
            const option = document.createElement('option');
            option.textContent = instrument;
            if (instrument === selectedInstrument) option.selected = true;
            instrumentSelector.appendChild(option);
        }
    }

    const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    function noteToMidi(note) {
        const match = note.match(/^([A-G][b#]?)(?:_k)?(\d)$/);

        if (!match) return 60; // default C4

        const [, n, octave] = match;
        const index = NOTES.indexOf(n);
        return index + (12 * (parseInt(octave) + 1));
    }


    function midiToNote(midi) {
        const note = NOTES[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return note + octave;
    }



    function applyTranspose(originalNote) {
        const midi = noteToMidi(originalNote);
        const transposedMidi = midi - transpose;
        return midiToNote(transposedMidi);
    }


    fretboard.addEventListener('mouseover', e => {
        if (!showAllNotes) {
            if ((e.target.classList.contains('half-left') ||
                e.target.classList.contains('half-right')) && !(e.target.classList.contains('note-fret'))) {
                e.target.style.setProperty('--noteDotOpacity', 1);
            }
            else {
                if (e.target.classList.contains('note-fret')) {
                    e.target.style.setProperty('--noteDotOpacity', 1);
                }
            }
        }
    });

    fretboard.addEventListener('mouseout', e => {
        if (!showAllNotes) {
            if (e.target.classList.contains('half-left') ||
                e.target.classList.contains('half-right') && !(e.target.classList.contains('note-fret'))) {
                e.target.style.setProperty('--noteDotOpacity', 0);
            }
            else {
                if (e.target.classList.contains('note-fret')) {
                    e.target.style.setProperty('--noteDotOpacity', 0);
                }
            }

        }
    });

    fretboard.addEventListener('mousedown', e => {
        if (e.target.classList.contains('half-left') ||
            e.target.classList.contains('half-right') ||
            e.target.classList.contains('note-fret')) {

            const targetFret = e.target.classList.contains('note-fret') ? e.target : e.target.closest('.note-fret');
            const stringEl = targetFret.closest('.string');
            const stringIndex = parseInt(stringEl.dataset.stringIndex);
            const fretIndex = Array.from(stringEl.children).indexOf(targetFret);

            const note = e.target.dataset.note;
            if (note) playNote(target);

            e.target.style.setProperty('--noteDotOpacity', 1);
        }
    });

    fretboard.addEventListener('mouseup', e => {
        if (e.target.classList.contains('half-left') ||
            e.target.classList.contains('half-right') ||
            e.target.classList.contains('note-fret')) {
            e.target.style.setProperty('--noteDotOpacity', 0);
        }
    });




    // Détecte si on est sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Map pour éviter les répétitions
    const activeTouches = new Set();

    if (isMobile) {
        fretboard.addEventListener('touchstart', e => {
            e.preventDefault(); // empêche le scroll

            const target = e.target.closest('.note-fret, .half-left, .half-right');
            if (!target || activeTouches.has(target)) return;

            activeTouches.add(target);

            const stringEl = target.closest('.string');
            const stringIndex = parseInt(stringEl.dataset.stringIndex);
            const fretIndex = Array.from(stringEl.children).indexOf(target.closest('.note-fret'));
            const note = target.dataset.note;

            if (note) playNote(target);
            target.style.setProperty('--noteDotOpacity', 1);
        });

        fretboard.addEventListener('touchend', e => {
            const target = e.target.closest('.note-fret, .half-left, .half-right');
            if (!target) return;
            target.style.setProperty('--noteDotOpacity', 0);
            activeTouches.delete(target);
        });

        fretboard.addEventListener('touchcancel', e => {
            const target = e.target.closest('.note-fret, .half-left, .half-right');
            if (!target) return;
            target.style.setProperty('--noteDotOpacity', 0);
            activeTouches.delete(target);
        });
    }






    accidentalSelector.addEventListener('click', e => {
        if (e.target.classList.contains('acc-select')) {
            accidentals = e.target.value;
            updateNotes();
        }
    });

    instrumentSelector.addEventListener("change", e => {
        selectedInstrument = e.target.value;

        buildFretboard();      // regenerate DOM
        updateStringStyle();   // adjust string thickness
        updateNotes();         // reapply notes based on tuning
    });


    document.getElementById("transposeUp").addEventListener("click", () => {
        transpose++;
        document.getElementById("transposeInput").value = transpose;
    });

    document.getElementById("transposeDown").addEventListener("click", () => {
        transpose--;
        document.getElementById("transposeInput").value = transpose;
    });

    document.getElementById("transposeInput").addEventListener("input", () => {
        transpose = parseInt(document.getElementById("transposeInput").value) || 0;
    });


    showAllNotesSelector.addEventListener('change', () => {
        showAllNotes = showAllNotesSelector.checked;
        document.querySelectorAll('.note-fret, .half-left, .half-right')
            .forEach(el => el.style.setProperty('--noteDotOpacity', showAllNotes ? 1 : 0));
    });

    setupInstrumentSelector();
    createSplitFrets();
    updateNotes();

    // --- KEYBOARD SUPPORT ---
    const keyboardMap = {

        // --- STRING 0 ---
        "é": { string: 0, fret: 0 },
        '"': { string: 0, fret: 1 },
        "'": { string: 0, fret: 2, half: "left" },
        "(": { string: 0, fret: 2, half: "right" },
        "-": { string: 0, fret: 3 },
        "è": { string: 0, fret: 4, half: "left" },
        "_": { string: 0, fret: 4, half: "right" },
        "ç": { string: 0, fret: 5 },

        // --- STRING 1 ---
        "z": { string: 1, fret: 0 },
        "e": { string: 1, fret: 1 },
        "r": { string: 1, fret: 2, half: "left" },
        "t": { string: 1, fret: 2, half: "right" },
        "y": { string: 1, fret: 3 },
        "u": { string: 1, fret: 4, half: "left" },
        "i": { string: 1, fret: 4, half: "right" },
        "o": { string: 1, fret: 5 },

        // --- STRING 2 ---
        "s": { string: 2, fret: 0 },
        "d": { string: 2, fret: 1 },
        "f": { string: 2, fret: 2, half: "left" },
        "g": { string: 2, fret: 2, half: "right" },
        "h": { string: 2, fret: 3 },
        "j": { string: 2, fret: 4, half: "left" },
        "k": { string: 2, fret: 4, half: "right" },
        "l": { string: 2, fret: 5 },

        // --- STRING 3 ---
        "x": { string: 3, fret: 0 },
        "c": { string: 3, fret: 1 },
        "v": { string: 3, fret: 2, half: "left" },
        "b": { string: 3, fret: 2, half: "right" },
        "n": { string: 3, fret: 3 },
        ",": { string: 3, fret: 4, half: "left" },
        ";": { string: 3, fret: 4, half: "right" },
        ":": { string: 3, fret: 5 },
    };

    const activeKeys = new Set();

    // KEY LISTENER
    document.addEventListener("keydown", e => {
        const key = e.key;
        if (!keyboardMap[key] || activeKeys.has(key)) return; // ignore si déjà enfoncée

        activeKeys.add(key);

        const { string, fret, half } = keyboardMap[key];
        const stringEl = document.querySelectorAll(".string")[string];
        if (!stringEl) return;

        const fretEl = stringEl.querySelectorAll(".note-fret")[fret];
        if (!fretEl) return;

        let target = fretEl;
        if (half === "left") target = fretEl.querySelector(".half-left");
        if (half === "right") target = fretEl.querySelector(".half-right");

        const fretIndex = Array.from(stringEl.children).indexOf(fretEl);
        const stringIndex = string;

        const note = target.dataset.note;
        if (note) playNote(target);

        // Highlight
        target.style.setProperty('--noteDotOpacity', 1);
    });

    document.addEventListener("keyup", e => {
        const key = e.key;
        if (!keyboardMap[key]) return;

        activeKeys.delete(key); // permet de rejouer la note après relâchement

        const { string, fret, half } = keyboardMap[key];
        const stringEl = document.querySelectorAll(".string")[string];
        if (!stringEl) return;

        const fretEl = stringEl.querySelectorAll(".note-fret")[fret];
        if (!fretEl) return;

        let target = fretEl;
        if (half === "left") target = fretEl.querySelector(".half-left");
        if (half === "right") target = fretEl.querySelector(".half-right");

        target.style.setProperty('--noteDotOpacity', 0); // enlève le highlight
    });






})();

