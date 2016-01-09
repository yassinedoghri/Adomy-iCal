var Planning = require('./Planning');
var _ = require('lodash');

/**
 * PlanningList class
 * Définit un objet planningList contenant une liste d'objets Plannings
 *
 * @class PlanningList
 * @property {Array} plannings liste d'objets plannings
 */
function PlanningList() {
    this.plannings = [];
}

PlanningList.prototype.size = function (planning) {
    return this.plannings.length;
};

PlanningList.prototype.addPlanning = function (planning) {
    if (planning instanceof Planning) {
        this.plannings.push(planning);
    } else {
        throw {name: "addPlanning", type: "error", message: "L'élément que vous voulez ajouter n'est pas un Objet Planning"};
    }
};

PlanningList.prototype.prospectiveConflicts = function (houseLocation) {
    // group all meetings with the same location onto a new planning
    var prospectiveConflicts = new Planning();
    for (var i = 0; i < this.plannings.length; i++) {
        for (var j = 0; j < this.plannings[i].size(); j++) {
            if (this.plannings[i].meetings[j]['location'] === houseLocation) {
                prospectiveConflicts.addMeeting(this.plannings[i].meetings[j]);
            }
        }
    }
    return prospectiveConflicts;
};

PlanningList.prototype.conflictsPlanning = function (prospectiveConflicts) {
    var conflictsPlanning = new Planning();
    var addedKeys = []; // array of already added keys to prevent duplicates
    var len = prospectiveConflicts.size();
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len; j++) {
            if ((i !== j) && (prospectiveConflicts.meetings[i].isOverlapping(prospectiveConflicts.meetings[j]))) {
                if (!contains.call(addedKeys, i)) {
                    addedKeys.push(i);
                    conflictsPlanning.addMeeting(prospectiveConflicts.meetings[i]);
                }
                if (!contains.call(addedKeys, j)) {
                    addedKeys.push(j);
                    conflictsPlanning.addMeeting(prospectiveConflicts.meetings[j]);
                }
            }
        }
    }

    return conflictsPlanning;
};

var contains = function (needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (needle) {
            var i = -1, index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function clone_object(o) {
    var n = Object.create(
            Object.getPrototypeOf(o),
            Object.getOwnPropertyNames(o).reduce(
            function (prev, cur) {
                prev[cur] = Object.getOwnPropertyDescriptor(o, cur);
                return prev;
            },
            {}
    )
            );
    if (!Object.isExtensible(o)) {
        Object.preventExtensions(n);
    }
    if (Object.isSealed(o)) {
        Object.seal(n);
    }
    if (Object.isFrozen(o)) {
        Object.freeze(n);
    }

    return n;
}

module.exports = PlanningList;