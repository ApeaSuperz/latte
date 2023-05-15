import variables from '@/styles/variables.module.less'

export function useDesign() {
  const lessVariables = variables

  function getPrefixClass(scope: string) {
    return lessVariables.namespace + '-' + scope
  }

  return {
    variables: lessVariables,
    getPrefixClass,
  }
}
