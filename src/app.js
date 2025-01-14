import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";

import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import BpmnModeler from "bpmn-js";

import sampleProcess from "../resources/sample.bpmn";
import sampleProcess2 from "../resources/sample-2.bpmn";


import qaPackage from "../resources/qa";
import gsPackage from "../resources/gs";


//var viewer = new BpmnModeler({
//    container: "#canvas",
//    moddleExtensions: {
//        qa: qaPackage,
//    },
//});

var viewer = new BpmnModeler({
	container: "#canvas",
	moddleExtensions: {
		gs: gsPackage,
	},
});

//viewer.importXML(sampleProcess);
viewer.importXML(sampleProcess2);

function getExtension(element, type) {
    if (!element.extensionElements) {
        return null;
    }

    return element.extensionElements.values.filter(function (e) {
        return e.$instanceOf(type);
    })[0];
}

viewer.on("element.click", function (event) {
    var element = event.element,
        moddle = viewer.get("moddle"),
        // the underlaying BPMN 2.0 element
        businessObject = element.businessObject,
        analysis,
        score,
        message;

    // do not allow on root element
    if (!element.parent) {
        return;
    }

    // we can access extension attribute properties
    score = businessObject.suitable;

    analysis = getExtension(businessObject, "qa:AnalysisDetails");

    // right click
    if (event.originalEvent.ctrlKey) {
        var result = parseFloat(
            window.prompt(
                "assign a new suitability score to " + businessObject.id
            ),
            10
        );

        if (isNaN(result)) {
            return;
        }

        businessObject.suitable = result;

        if (!analysis) {
            analysis = moddle.create("qa:AnalysisDetails");
            businessObject.extensionElements =
                businessObject.extensionElements ||
                moddle.create("bpmn:ExtensionElements");
            businessObject.extensionElements.get("values").push(analysis);
        }

        analysis.lastChecked = new Date().toString();
    } else {
        if (isNaN(score)) {
            message = "No suitability score yet, CTRL+Click to assign one";
        } else {
            message = "Diagram element has a suitability score of " + score;
        }

        if (analysis) {
            message += "\n Last analyzed at " + analysis.lastChecked;
        }

        window.alert(message);
    }
});

document
    .querySelector("#export-to-console")
    .addEventListener("click", async function (e) {
        try {
            const { xml } = await viewer.saveXML({ format: true });

            console.log(xml);
        } catch (err) {
            console.error(err);
        }

        e.preventDefault();
    });
