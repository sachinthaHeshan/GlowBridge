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
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    function createContext<T>(defaultValue: T): React.Context<T>;
    function useContext<T>(context: React.Context<T>): T;
    
    interface Context<T> {
      Provider: React.ComponentType<{ value: T; children?: React.ReactNode }>;
      Consumer: React.ComponentType<{ children: (value: T) => React.ReactNode }>;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      span: any;
      p: any;
      button: any;
      input: any;
      label: any;
      form: any;
      select: any;
      option: any;
      textarea: any;
      img: any;
      svg: any;
      path: any;
      circle: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      ul: any;
      li: any;
      a: any;
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      section: any;
      article: any;
      header: any;
      footer: any;
      nav: any;
      main: any;
      aside: any;
      [elemName: string]: any;
    }
    
    interface Element {
      type: any;
      props: any;
      key: any;
    }
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
