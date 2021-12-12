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
  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId;
  }
}

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock();
    const checkLastEventStatus = new CheckLastEventStatus(
      loadLastEventRepository
    );

    await checkLastEventStatus.perform("any_group_id");

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
  });
});
