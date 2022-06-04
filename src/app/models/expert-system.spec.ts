import { ExpertSystem } from './expert-system';

declare let outputs: any; //Map<string, any>;
declare let knowledge: any; // Map<string, any>;
declare function log(category: string, message: string): void;
declare function addKnowledge(tag: string, data: any): void;

describe('ExpertSystem', () => {
  it('should create an instance', () => {
    expect(new ExpertSystem()).toBeTruthy();
  });
  it('should produce the correct knowledge', () => {
    const es = new ExpertSystem();
    const outputDefaults = new Map([['finalNumber', 0]]);
    es.setOutputDefualts(outputDefaults);
    es.addKnowledge('a', 4);
    es.addKnowledge('b', 12);
    es.addRule('B and C exist', () => { if (knowledge.get('b') && knowledge.get('c')) { outputs.set('finalNumber', 4); } });
    es.addRule('a = 4', () => {
      const x = knowledge.get('a');
      if (x === 4) {
        addKnowledge('c', 12);
      }
    });
    es.Start();
    expect(JSON.stringify(Array.from(es.knowledge.entries()))).toEqual('[["a",4],["b",12],["c",12]]');
    expect(JSON.stringify(Array.from(es.outputs.entries()))).toEqual('[["finalNumber",4]]');
  });
});
