import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '常用软件',
    Svg: require('@site/static/img/apps.svg').default,
    description: (
      <>
        Docker，Git，MySQL，OpenSSL 等工具的配置和使用记录。
      </>
    ),
  },
  {
    title: '系统管理',
    Svg: require('@site/static/img/terminal.svg').default,
    description: (
      <>
        Linux 和 Windows 操作系统的配置和使用记录。
      </>
    ),
  },
  {
    title: '编程语言',
    Svg: require('@site/static/img/code.svg').default,
    description: (
      <>
        Go，JavaScript，Ruby 等编程语言的笔记和代码片段。
      </>
    ),
  },
  {
    title: '其他杂项',
    Svg: require('@site/static/img/archive.svg').default,
    description: (
      <>
        开发实践过程中其他类别的个人笔记和代码片段。
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
