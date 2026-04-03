import { DailyReport, Employee } from '../types'
import { formatDate } from '../utils/date'

export async function exportConsolidatedDailyPdf(
  date: string,
  reports: DailyReport[],
  employees: Employee[]
): Promise<void> {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let y = margin

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('StatusFlow - Relatório Consolidado', pageWidth / 2, y, { align: 'center' })
    y += 15

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Data: ${formatDate(date)}`, margin, y)
    y += 15

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Summary section
    const totalTasks = reports.reduce((sum, r) => sum + r.tasks.length, 0)
    const completedTasks = reports.reduce(
      (sum, r) => sum + r.tasks.filter(t => t.completed).length,
      0
    )
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Geral:', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total de funcionários com tarefas: ${reports.length}`, margin, y)
    y += 6
    doc.text(`Total de tarefas: ${totalTasks}`, margin, y)
    y += 6
    doc.text(`Tarefas concluídas: ${completedTasks}`, margin, y)
    y += 6
    doc.text(`Tarefas pendentes: ${pendingTasks}`, margin, y)
    y += 6
    doc.text(`Taxa de conclusão geral: ${completionRate.toFixed(1)}%`, margin, y)
    y += 10

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Employees section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalhes por Funcionário:', margin, y)
    y += 10

    if (reports.length === 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Nenhuma tarefa registrada para esta data.', margin, y)
    } else {
      for (const report of reports) {
        const employee = employees.find(emp => emp.id === report.employeeId)
        if (!employee) continue

        // Check if we need a new page
        if (y > pageHeight - 60) {
          doc.addPage()
          y = margin
        }

        // Employee info
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${employee.name} - ${employee.role}`, margin, y)
        y += 6

        const empTotal = report.tasks.length
        const empCompleted = report.tasks.filter(t => t.completed).length
        const empPending = empTotal - empCompleted
        const empRate = empTotal > 0 ? (empCompleted / empTotal) * 100 : 0

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Tarefas: ${empTotal} | Concluídas: ${empCompleted} | Pendentes: ${empPending} | Taxa: ${empRate.toFixed(1)}%`,
          margin,
          y
        )
        y += 8

        // Tasks list
        if (report.tasks.length === 0) {
          doc.setFontSize(9)
          doc.text('  Nenhuma tarefa registrada.', margin, y)
          y += 6
        } else {
          report.tasks.forEach((task, index) => {
            const checkbox = task.completed ? '[x]' : '[ ]'
            const textColor = task.completed ? 100 : 0

            doc.setTextColor(textColor, textColor, textColor)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.text(`  ${index + 1}. ${checkbox} ${task.text}`, margin, y)
            y += 5
          })
        }

        doc.setTextColor(0, 0, 0)
        y += 5

        // Separator between employees
        doc.setLineWidth(0.3)
        doc.line(margin, y, pageWidth - margin, y)
        y += 8
      }
    }

    // Save the PDF
    const fileName = `StatusFlow_Consolidado_${date}.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error('Error generating consolidated PDF:', error)
    throw new Error('Falha ao gerar PDF consolidado. Verifique se o navegador suporta a função.')
  }
}
