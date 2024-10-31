var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
export var WalletType;
(function (WalletType) {
    WalletType["RECEIVING"] = "receiving";
    WalletType["SENDING"] = "sending";
})(WalletType || (WalletType = {}));
export var CurrencyType;
(function (CurrencyType) {
    CurrencyType["BTC"] = "BTC";
    CurrencyType["USDT_BEP20"] = "USDT_BEP20";
    CurrencyType["USDT_TRC20"] = "USDT_TRC20";
    CurrencyType["USDT_ERC20"] = "USDT_ERC20";
})(CurrencyType || (CurrencyType = {}));
let Wallet = class Wallet {
    id;
    wallet_type;
    currency_type;
    wallet_name;
    pub_key;
    address;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Wallet.prototype, "id", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: WalletType,
        default: WalletType.RECEIVING,
    }),
    __metadata("design:type", String)
], Wallet.prototype, "wallet_type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: CurrencyType,
    }),
    __metadata("design:type", String)
], Wallet.prototype, "currency_type", void 0);
__decorate([
    Column({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Wallet.prototype, "wallet_name", void 0);
__decorate([
    Column({ type: 'varchar', length: 256, unique: true }),
    __metadata("design:type", String)
], Wallet.prototype, "pub_key", void 0);
__decorate([
    Column({ type: 'varchar', length: 256, unique: true, default: '' }),
    __metadata("design:type", String)
], Wallet.prototype, "address", void 0);
Wallet = __decorate([
    Entity()
], Wallet);
export { Wallet };
