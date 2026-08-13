import fs from 'fs';
import path from 'path';

interface TestStats {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  executionTime: number;
  passRate: string;
  timestamp: string;
}

async function generateMetrics(): Promise<void> {
  try {
    // Read the JSON test results
    const resultsPath = path.join(process.cwd(), 'test-results/results.json');

    if (!fs.existsSync(resultsPath)) {
      console.log('⚠️  No test results found. Run tests first with: npm test');
      return;
    }

    const rawResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    // Calculate metrics
    const totalTests = rawResults.stats.expected;
    const failed = rawResults.stats.failed;
    const skipped = rawResults.stats.skipped;
    const passed = totalTests - failed - skipped;
    const executionTime = rawResults.stats.duration;
    const passRate = ((passed / totalTests) * 100).toFixed(2);

    const summary: TestStats = {
      totalTests,
      passed,
      failed,
      skipped,
      executionTime,
      passRate: `${passRate}%`,
      timestamp: new Date().toISOString(),
    };

    // Write summary to file
    const summaryPath = path.join(process.cwd(), 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Print summary to console
    console.log('\n📊 Test Execution Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Passed:        ${passed}/${totalTests}`);
    console.log(`❌ Failed:        ${failed}`);
    console.log(`⏭️  Skipped:       ${skipped}`);
    console.log(`⏱️  Duration:      ${(executionTime / 1000).toFixed(2)}s`);
    console.log(`📈 Pass Rate:     ${passRate}%`);
    console.log(`⏰ Timestamp:     ${summary.timestamp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Color-coded pass rate
    const passRateNum = parseFloat(passRate);
    if (passRateNum === 100) {
      console.log('🎉 All tests passed! Excellent work.\n');
    } else if (passRateNum >= 90) {
      console.log('✨ High pass rate. Minor issues to address.\n');
    } else if (passRateNum >= 70) {
      console.log('⚠️  Pass rate below 90%. Review failing tests.\n');
    } else {
      console.log('🔴 Low pass rate. Significant test failures detected.\n');
    }

    console.log(`📄 Full summary saved to: ${summaryPath}`);
  } catch (error) {
    console.error('Error generating metrics:', error);
    process.exit(1);
  }
}

generateMetrics();
