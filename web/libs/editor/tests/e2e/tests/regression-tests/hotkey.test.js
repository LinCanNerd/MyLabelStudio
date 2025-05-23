Feature("Hotkeys").tag("@regress");

const AUDIO_URL = "/public/files/barradeen-emotional.mp3";

Scenario("Hotkeys on re-initing lsf", async ({ I, LabelStudio, AtAudioView, AtOutliner }) => {
  const params = {
    annotations: [{ id: "test", result: [] }],
    config: `<View>
  <Labels name="label" toName="audio" zoom="true" hotkey="ctrl+enter">
    <Label value="Speaker one" background="#00FF00"/>
    <Label value="Speaker two" background="#12ad59"/>
  </Labels>
  <Audio name="audio" value="$audio" />
</View>`,
    data: {
      audio: AUDIO_URL,
    },
  };

  LabelStudio.setFeatureFlags({
    ff_front_dev_2715_audio_3_280722_short: true,
  });
  I.amOnPage("/");

  I.say("Init LabelStudio");

  LabelStudio.init(params);
  await AtAudioView.waitForAudio();

  I.say("Re-init LabelStudio");

  LabelStudio.init(params);
  await AtAudioView.waitForAudio();

  AtOutliner.seeRegions(0);

  I.say("Draw region");

  await AtAudioView.lookForStage();
  I.pressKey("1");
  AtAudioView.dragAudioElement(50, 300);
  I.pressKey("u");
  AtOutliner.seeRegions(1);

  I.say("Try to delete it by backspace hotkey");
  AtAudioView.clickAt(150);
  I.pressKey("Backspace");
  AtOutliner.seeRegions(0);

  I.say("Reset selected labels");
  I.pressKey("u");

  I.say("Draw a couple of regions");

  for (let k = 0; k < 5; k++) {
    I.pressKey("2");
    AtAudioView.dragAudioElement(50 + 50 * k, 30);
    I.pressKey("u");
  }
  AtOutliner.seeRegions(5);

  I.say("Try to delete all regions by ctrl+backspace hotkey");

  I.pressKey(["CommandOrControl", "Backspace"]);
  I.acceptPopup();

  AtOutliner.seeRegions(0);
});
