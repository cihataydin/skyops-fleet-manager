import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0];
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) return false;

          return new Date(value) > new Date(relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0];
          return `${args.property} must be a future date strictly after ${relatedPropertyName}.`;
        },
      },
    });
  };
}
