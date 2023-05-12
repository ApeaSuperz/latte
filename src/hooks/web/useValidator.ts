export function useValidator() {
  function required(message?: string) {
    return {
      required: true,
      message: message ?? '该项为必填项',
    }
  }

  function number(message?: string) {
    return {
      type: 'number',
      message: message ?? '值应为数字',
    }
  }

  return {
    required,
    number,
  }
}
