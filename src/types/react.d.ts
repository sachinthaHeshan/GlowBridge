declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    interface Component<P = {}, S = {}, SS = any> {
      render(): ReactNode;
    }
    
    interface FunctionComponent<P = {}> {
      (props: P): ReactElement | null;
    }
    
    type FC<P = {}> = FunctionComponent<P>;
    
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
    
    type Key = string | number;
    type ReactFragment = {} | ReactNodeArray;
    interface ReactPortal extends ReactElement {
      key: Key | null;
      children: ReactNode;
    }
    interface ReactNodeArray extends Array<ReactNode> {}
    
    type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement | null)
      | (new (props: P) => Component<any, any>);
      
    function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
