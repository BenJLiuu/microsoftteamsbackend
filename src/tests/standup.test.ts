
import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestStandupStart,
  requestStandupActive,
  requestStandupSend,
  requestChannelMessages
} from './httpHelper';

describe('standupStartV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token + 'x', channel.channelId, 1)).toEqual(403);
  });
  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token, channel.channelId + 69, 1)).toEqual(400);
  });
  test('error: negative length', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupStart(user.token, channel.channelId, -3)).toEqual(400);
  });
  test('error: active standup currently running in channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 1);
    expect(requestStandupStart(user.token, channel.channelId, 1)).toEqual(400);
  });

  test('error: channelId is valid but authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    expect(requestStandupStart(user2.token, channel.channelId, 1)).toEqual(403);
  });

  test('successful activation', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    expect(requestStandupStart(user1.token, channel.channelId, 0)).toEqual({ timeFinish: expect.any(Number) });
  });

  // More successful use cases for standupStart are tested in standupActive and standupMessages in detail; as testing of a
  // standup's functionality requires extensive use of both of those functions.
});

describe('standupActiveV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupActive(user.token + 'x', channel.channelId)).toEqual(403);
  });

  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupActive(user.token, channel.channelId + 69)).toEqual(400);
  });
  test('error: channelId is valid but authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    expect(requestStandupActive(user2.token, channel.channelId)).toEqual(403);
  });

  test('successful call - active standup', () => {
    const expectedTimeFinish = Math.floor(Date.now() / 1000) + 90;
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 90);

    const standup = requestStandupActive(user.token, channel.channelId);
    expect(standup).toEqual({
      isActive: true,
      timeFinish: expect.any(Number)
    });

    expect(
      standup.timeFinish >= expectedTimeFinish &&
      standup.timeFinish <= expectedTimeFinish + 1
    ).toEqual(true);
  });

  test('successful call - inactive standup', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);

    const standup = requestStandupActive(user.token, channel.channelId);
    expect(standup).toEqual({
      isActive: false,
      timeFinish: null
    });
  });
});

describe('standupSendV1 tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('error: invalid token', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token + 'x', channel.channelId, 'hello')).toEqual(403);
  });

  test('error: invalid channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token, channel.channelId + 69, 'hello')).toEqual(400);
  });

  test('error: message is over 1000 characters', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 0.1);
    expect(requestStandupSend(user.token, channel.channelId, 'ernncggcenccinrnneiiergenrgincgnceegcrgegeicecccrneerecericgnigreincnncrrieicnecgnnergrginnrgciinreggcerrcnciccccrriigegigniniecgigiccgeegiiegicggergnenegeeigcgcrggigrnniiienccgrccgicriireeicerniecenicgrrinrcigneierneegncrrccggricerciecgeirgicrgnnirgcnegiecgeggreciegcrieiigrcgecrergngiirrcncneereinncrcerrcnerrgrcngegrgrrcrccieigeeceggerineiingreerginieircrirrrgrercgircnriggrinrrngeienccgieicnreccreningcnrerceiigeineenrrrerirrinininririecirrecigiiginrngiirrcrgcigggcrginiiigcngrrncinnrcrrcngrgninrrrncecngiriiccegirinnnggcnnceenigergceeengicncgggrgeccncireineenniciinengeigcegnigenrnncneececgngcggnrrieicrnnnrninenrrrececiecirnergrcigcreeennereeggggiicirerecgenenieeeciccrnneegcgnngcccgnrncecrgneggregrgencineiccngnineicgnnircigrrnggggrriiirreegreencgcceeigcgrgecnngineiiicrreernecngggeiireengreicciigircgincncceregniiecggreignncrgcrccginennggicncinccregierciinrcgicrrrcgnicgicinngiegrcnninrencrrreegggnerngeigrrceggreriecicrgeererinencingcgiengieggeigegenngiggrngerccgieccccigeggreccnigircrininrrreeei')).toEqual(400);
  });

  test('error: an active standup is not currently running in the channel', () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    expect(requestStandupSend(user.token, channel.channelId, 'hello')).toEqual(400);
  });

  test('error: channelId is valid and the authorised user is not a member of the channel', () => {
    const user1 = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const user2 = requestAuthRegister('creed@gmail.com', 'creed123', 'Creed', 'Bratton');
    const channel = requestChannelsCreate(user1.token, 'Example', true);
    requestStandupStart(user1.token, channel.channelId, 0.1);
    expect(requestStandupSend(user2.token, channel.channelId, 'fail')).toEqual(403);
  });

  test('successful call - active standup', async () => {
    const user = requestAuthRegister('kevin@gmail.com', 'office123', 'Kevin', 'Malone');
    const channel = requestChannelsCreate(user.token, 'Example', true);
    requestStandupStart(user.token, channel.channelId, 0.05);

    requestStandupSend(user.token, channel.channelId, 'hello1');
    requestStandupSend(user.token, channel.channelId, 'hello2');
    requestStandupSend(user.token, channel.channelId, 'hello3');
    requestStandupSend(user.token, channel.channelId, 'hello4');

    function delay(delay: number) {
      return new Promise(resolve => setTimeout(resolve, delay));
    }

    await delay(4000);

    expect(requestChannelMessages(user.token, channel.channelId, 0)).toEqual({
      messages: [
        {
          message: 'kevinmalone: hello1\nkevinmalone: hello2\nkevinmalone: hello3\nkevinmalone: hello4',
          messageId: expect.any(Number),
          timeSent: expect.any(Number),
          uId: user.authUserId
        }
      ],
      start: 0,
      end: -1
    });
  });
});
