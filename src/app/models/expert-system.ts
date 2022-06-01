export declare let outputs: Map<string, any>;
export declare let knowledge: Map<string, any>;
export declare function log(category: string, message: string): void;
export declare function addKnowledge(tag: string, data: any): void;

export class ExpertSystem {

  public outputs: Map<string, any>;
  public knowledge: Map<string, any>;
  public logs: Map<string, Set<string>>;
  
  private outputDefaults: Map<string, any>;
  private rules: Array<any> = new Array();

  constructor() {

  }


  public addRule(rule: any) {
    const ruleString: string = rule.toString();
    if (!(ruleString.startsWith('()') || ruleString.startsWith('function'))) {
      throw new Error('Invalid Rule Formatting');
    }

    let ruleTrimmedString: any = ruleString.split('{');
    ruleTrimmedString.shift();
    ruleTrimmedString = ruleTrimmedString.join('{').split('}');
    ruleTrimmedString.pop();
    ruleTrimmedString = ruleTrimmedString.join('}');

    const newRule = (new Function('with (this) {return ' + ruleTrimmedString + '}')).bind(this);

    this.rules.push(newRule);

  }

  public setOutputDefualts(outputDefaults: Map<string, any>) {
    this.outputDefaults = outputDefaults;
  }

  public addKnowledge(tag: string, data: any): any {
    this.knowledge.set(tag, data);
  }

  public addKnowledgeMap(info: Map<string, any>): any {
    info.forEach((value: any, key: string) => {
      this.knowledge.set(key, value);
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public Start() {
    let startingKnowledge;
    let endingKnowledge;
    // eslint-disable-next-line eqeqeq
    while (startingKnowledge == endingKnowledge) {
      startingKnowledge = JSON.stringify(this.knowledge);
      this.outputs = this.outputDefaults;

      for (const rule of this.rules) {
        try { rule(); } catch { };
      }

      endingKnowledge = JSON.stringify(this.knowledge);

    }
    return outputs;

  }

  private log(category: string, message: string) {
    if (!this.logs.has(category)) {
      this.logs.set(category, new Set<string>());
    }
    this.logs[category].add(message);
  }




}
