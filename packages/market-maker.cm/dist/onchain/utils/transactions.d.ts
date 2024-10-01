import { NewTxContinue, NewTxJump, PreparedOperation } from '@coinweb/contract-kit';
export declare const constructSendCweb: any;
type ConditionalInput = PreparedOperation[] | PreparedOperation | NewTxContinue | NewTxJump;
type ConditionalAltInput<TInput extends ConditionalInput> = TInput extends NewTxContinue ? NewTxContinue | NewTxJump : TInput extends NewTxJump ? NewTxContinue | NewTxJump : PreparedOperation[] | PreparedOperation;
type ConditionalOutput<TInput extends ConditionalInput> = TInput extends NewTxContinue ? NewTxContinue[] : TInput extends NewTxJump ? NewTxJump[] : PreparedOperation[];
type ConstructConditional = <TInput extends ConditionalInput, TAltInput extends ConditionalAltInput<TInput>>(condition: boolean, ops: TInput, altOps?: TAltInput) => ConditionalOutput<TInput> | ConditionalOutput<TAltInput>;
export declare const constructConditional: ConstructConditional;
export {};
