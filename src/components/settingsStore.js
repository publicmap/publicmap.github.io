import { writable } from 'svelte/store';

export const settingsStore = writable({
    title : "Public Map"
});

export const pageTitle = "Public Map";