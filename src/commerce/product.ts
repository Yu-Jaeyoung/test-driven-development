import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  dataKey: number;

  @Column({ unique: true })
  id: string;

  @Column()
  sellerId: string;
}