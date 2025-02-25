import * as React from 'react';
import packageJson from '../../package2.json';

type Props = {
    name: string
    dev: boolean
};

function VersionReader({ name, dev }: Props) {
  return (
    <span>
      {packageJson[dev ? 'devDependencies' : 'dependencies'][name]}
    </span>
  );
}

export default VersionReader;
