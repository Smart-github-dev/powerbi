import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PowerBiState {
    reports: [],
    selected: any
}

const initialState: PowerBiState = {
    reports: [],
    selected: null
}

const powerBiSlice = createSlice({
    name: 'powerbi',
    initialState,
    reducers: {
        setData: (state, action) => {
            state.reports = action.payload
        },
        selectReport: (state, action) => {
            state.selected = action.payload
        }
    },
});

export const { setData, selectReport } = powerBiSlice.actions;


const reducer = combineReducers({
    powerbi: powerBiSlice.reducer
});

export default reducer;