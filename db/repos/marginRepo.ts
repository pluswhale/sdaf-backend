import { LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../AppDataSource"
import { Margin } from "../entities"

const marginRepo = AppDataSource.getRepository(Margin);

export const getMarginByPrice = async (price: string) => {
  return await marginRepo.findOneBy({
    minPrice: LessThan(+price),
    maxPrice: MoreThan(+price)
  })
}