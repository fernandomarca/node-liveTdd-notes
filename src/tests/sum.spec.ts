class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async perform(groupId: string): Promise<string> {
    this.loadLastEventRepository.loadLastEvent(groupId);
    return "done";
  }
}

interface ILoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<undefined>;
}

class LoadLastEventRepositorySpy implements ILoadLastEventRepository {
  groupId!: string;
  callsCount = 0;
  output: undefined;
  async loadLastEvent(groupId: string): Promise<undefined> {
    this.groupId = groupId;
    this.callsCount++;
    return this.output;
  }
}

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy();
    const sut = new CheckLastEventStatus(loadLastEventRepository);

    await sut.perform("any_group_id");

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });
  it("should return status done when group has no event", async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy();
    loadLastEventRepository.output = undefined;
    const sut = new CheckLastEventStatus(loadLastEventRepository);

    const status = await sut.perform("any_group_id");

    expect(status).toBe("done");
  });
});
