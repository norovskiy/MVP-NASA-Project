import {create} from 'zustand';
export const useExplorerStore=create(set=>({planet:'mars',rotating:false,reset:0,focus:null,descending:false,select:planet=>set(s=>({planet,focus:null,descending:false,reset:s.reset+1})),toggleRotation:()=>set(s=>({rotating:!s.rotating})),resetView:()=>set(s=>({focus:null,reset:s.reset+1})),setFocus:focus=>set({focus,rotating:false})}));
