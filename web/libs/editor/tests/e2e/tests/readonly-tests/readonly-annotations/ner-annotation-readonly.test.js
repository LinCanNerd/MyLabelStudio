Feature("Readonly Annotation");

const imageExamples = new DataTable(["example", "regionName"]);

imageExamples.add([require("../../../examples/text-html"), "Date"]);

Data(imageExamples).Scenario("NER Readonly Annotations", async ({ I, current, LabelStudio, AtOutliner }) => {
  I.amOnPage("/");
  const { config, result, data } = current.example;
  const regions = result.filter((r) => {
    return r.type.match("labels");
  });

  const params = {
    annotations: [
      {
        id: "test",
        readonly: true,
        result,
      },
    ],
    config,
    data,
  };

  LabelStudio.init(params);

  I.say("Check region is selectable");
  AtOutliner.seeRegions(regions.length);
  AtOutliner.clickRegion(current.regionName);
  //
  I.pressKey("Backspace");
  I.say("Results are equal after deletion attempt");
  await LabelStudio.resultsNotChanged(result);
  //
  I.say("Can't draw new shape");
  I.pressKey("1");
  //
  AtOutliner.seeRegions(regions.length);
});
