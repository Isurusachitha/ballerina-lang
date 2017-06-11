/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import _ from 'lodash';
import log from 'log';
import AbstractSourceGenVisitor from './abstract-source-gen-visitor';
import SourceGenUtil from './source-gen-util';

class AnnotationDefinitionVisitor extends AbstractSourceGenVisitor {
    constructor(parent) {
        super(parent);
    }

    canVisitAnnotationDefinition(annotationDefinition) {
        return true;
    }

    beginVisitAnnotationDefinition(annotationDefinition) {
        let useDefaultWS = annotationDefinition.whiteSpace.useDefault;

        if (useDefaultWS) {
            this.currentPrecedingIndentation = this.getCurrentPrecedingIndentation();
            this.replaceCurrentPrecedingIndentation('\n' + this.getIndentation());
        }
        let constructedSourceSegment = '';
        _.forEach(annotationDefinition.getChildrenOfType(annotationDefinition.getFactory().isAnnotation), annotationNode => {
            if (annotationNode.isSupported()) {
                constructedSourceSegment += annotationNode.toString()
                  + ((annotationNode.whiteSpace.useDefault) ? this.getIndentation() : '');
            }
        });

        constructedSourceSegment += 'annotation' + annotationDefinition.getWSRegion(0)
            + annotationDefinition.getAnnotationName() + annotationDefinition.getWSRegion(1);
        if (annotationDefinition.getAttachmentPoints().length > 0) {
            constructedSourceSegment += 'attach';
            annotationDefinition.getAttachmentPoints().forEach((attachmentPoint, index) => {
                constructedSourceSegment += annotationDefinition.getChildWSRegion('attachmentPoints.children.' + attachmentPoint, 0)
                    + attachmentPoint
                    + annotationDefinition.getChildWSRegion('attachmentPoints.children.' + attachmentPoint, 1);
                if (index  + 1 < annotationDefinition.getAttachmentPoints().length) {
                    constructedSourceSegment += ',';
                }
            });
        }
        constructedSourceSegment += '{' + annotationDefinition.getWSRegion(3);
        if (useDefaultWS) {
            constructedSourceSegment += this.getIndentation();
        }
        this.indent();
        let self = this;
        _.each(annotationDefinition.getAnnotationAttributeDefinitions(), function (attrDefinition) {
            let currentPrecedingIndentation = SourceGenUtil.getTailingIndentation(constructedSourceSegment);
            if (attrDefinition.whiteSpace.useDefault) {
                constructedSourceSegment = SourceGenUtil.replaceTailingIndentation(constructedSourceSegment, self.getIndentation());
            }
            constructedSourceSegment += attrDefinition.getAttributeStatementString();
            if (attrDefinition.whiteSpace.useDefault) {
                constructedSourceSegment += currentPrecedingIndentation;
            }
        });

        this.appendSource(constructedSourceSegment);
        log.debug('Begin Visit Annotation Definition');
    }

    visitAnnotationDefinition(annotationDefinition) {
        log.debug('Visit Annotation Definition');
    }

    endVisitAnnotationDefinition(annotationDefinition) {
        this.outdent();
        this.appendSource('}' + annotationDefinition.getWSRegion(4));
        this.getParent().appendSource(this.getGeneratedSource());
        log.debug('End Visit Annotation Definition');
    }
}

export default AnnotationDefinitionVisitor;
