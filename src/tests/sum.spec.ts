import { set, reset } from "mockdate";
class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async perform({ groupId }: { groupId: string }): Promise<string> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId });
    return event === undefined ? "done" : "active";
  }
}

type LoadLastEventReturn = { endDate: Date } | undefined;

interface ILoadLastEventRepository {
  loadLastEvent: (input: { groupId: string }) => Promise<LoadLastEventReturn>;
}
class LoadLastEventRepositorySpy implements ILoadLastEventRepository {
  groupId?: string;
  callsCount = 0;
  output: LoadLastEventReturn;
  async loadLastEvent(input: {
    groupId: string;
  }): Promise<LoadLastEventReturn> {
    const { groupId } = input;
    this.groupId = groupId;
    this.callsCount++;
    return this.output;
  }
}

type SutOutput = {
  sut: CheckLastEventStatus;
  loadLastEventRepository: LoadLastEventRepositorySpy;
};

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy();
  const sut = new CheckLastEventStatus(loadLastEventRepository);
  return { sut, loadLastEventRepository };
};

describe("CheckLastEventStatus", () => {
  beforeAll(() => {
    set(new Date());
  });
  afterAll(() => {
    reset();
  });
  it("should get last event data", async () => {
    const { sut, loadLastEventRepository } = makeSut();

    await sut.perform({ groupId: "any_group_id" });

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });
  it("should return status done when group has no event", async () => {
    const { sut, loadLastEventRepository } = makeSut();
    loadLastEventRepository.output = undefined;

    const status = await sut.perform({ groupId: "any_group_id" });

    expect(status).toBe("done");
  });
  it("should return status active when now is before event end time", async () => {
    const { sut, loadLastEventRepository } = makeSut();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1),
    };

    const status = await sut.perform({ groupId: "any_group_id" });

    expect(status).toBe("active");
  });
});
