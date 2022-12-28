import { Part1, Part1Builder } from './Part1'


export type Part2 = Part1 | string

export class Part2Builder<T = Part2> {

  private constructor(private part2: Part2 | undefined = undefined){}

  as(part2: Part2): Part2Builder {
    this.part2 = part2;
    return this as any;
  }

  part1(part1: Part1 | ((part1: ReturnType<typeof Part1Builder.create>) => Part1Builder)): Part2Builder {
    if (typeof part1 === 'function'){
      this.part2 = part1(Part1Builder.create()).build();
    } else {
      this.part2 = part1;
    }
    return this as any;
  }

  build(): T {
    return this.part2 as any;
  }

  static create(): Part2Builder<{}> {
    return new Part2Builder();
  }

}

