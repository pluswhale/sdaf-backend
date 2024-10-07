import { Key } from '../constants';
export const createMakerStateFirstPart = () => [Key.MAKER_STATE];
export const createMakerDepositFirstPart = () => [Key.MAKER_AVAILABLE_BALANCE];
export const createMakerStateKey = (id) => ({
    first_part: createMakerStateFirstPart(),
    second_part: [id],
});
export const createMakerDepositKey = (user) => ({
    first_part: createMakerDepositFirstPart(),
    second_part: [user],
});
