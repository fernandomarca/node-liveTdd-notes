class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async perform(groupId: string): Promise<void> {
    this.loadLastEventRepository.loadLastEvent(groupId);
  }
}

interface ILoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<void>;
}

class LoadLastEventRepositoryMock implements ILoadLastEventRepository {
  groupId!: string;
  callsCount = 0;
  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId;
    this.callsCount++;
  }
}

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock();
    const sut = new CheckLastEventStatus(loadLastEventRepository);

    await sut.perform("any_group_id");

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });
});
