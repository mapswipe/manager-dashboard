import { createContext } from 'react';

export interface InputInteractivityContextProps {
    focused: boolean;
    setFocused: React.Dispatch<React.SetStateAction<boolean>>;
    hovered: boolean;
    setHovered: React.Dispatch<React.SetStateAction<boolean>>;
    disabled: boolean;
}

const InputInteractivityContext = createContext<InputInteractivityContextProps>({
    focused: false,
    // eslint-disable-next-line no-console
    setFocused: () => { console.warn('InputInteractivityContext::setFocused called without a provider'); },
    hovered: false,
    // eslint-disable-next-line no-console
    setHovered: () => { console.warn('InputInteractivityContext::setHovered called without a provider'); },
    disabled: false,
});

export default InputInteractivityContext;
