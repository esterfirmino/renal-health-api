import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/u;

@ValidatorConstraint({ async: false })
export class NoEmojisConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return true;
    return !EMOJI_REGEX.test(value);
  }

  defaultMessage(): string {
    return 'O campo $property não pode conter emojis';
  }
}

export function NoEmojis(validationOptions?:ValidationOptions){
  return function(object: object, propertyName:string){
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints:[],
      validator: NoEmojisConstraint,
    })
  }
}
