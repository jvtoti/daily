import { DailyReport, Employee } from '../types'
import { formatDate } from '../utils/date'

export async function exportDailyReportPdf(
  report: DailyReport,
  employee: Employee
): Promise<void> {
  try {
    // Dynamically import jsPDF to avoid loading it if not needed
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('StatusFlow - Relatório Diário', pageWidth / 2, y, { align: 'center' })
    y += 15

    // Employee info
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Funcionário: ${employee.name}`, margin, y)
    y += 8
    doc.text(`Cargo: ${employee.role}`, margin, y)
    y += 8
    doc.text(`Data: ${formatDate(report.date)}`, margin, y)
    y += 15

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Tasks section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Tarefas:', margin, y)
    y += 10

    if (report.tasks.length === 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Nenhuma tarefa registrada para esta data.', margin, y)
      y += 10
    } else {
      report.tasks.forEach((task, index) => {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        // Checkbox icon
        const checkbox = task.completed ? '[x]' : '[ ]'
        const statusText = task.completed ? 'CONCLUÍDA' : 'PENDENTE'
        const textColor = task.completed ? 100 : 0

        doc.setTextColor(textColor, textColor, textColor)
        doc.text(`${index + 1}. ${checkbox} ${task.text}`, margin, y)
        y += 6
        doc.text(`   Status: ${statusText}`, margin + 10, y)
        y += 8
      })
    }

    // Summary section
    y += 5
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    const totalTasks = report.tasks.length
    const completedTasks = report.tasks.filter(t => t.completed).length
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo:', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total de tarefas: ${totalTasks}`, margin, y)
    y += 6
    doc.text(`Tarefas concluídas: ${completedTasks}`, margin, y)
    y += 6
    doc.text(`Tarefas pendentes: ${pendingTasks}`, margin, y)
    y += 6
    doc.text(`Taxa de conclusão: ${completionRate.toFixed(1)}%`, margin, y)

    // Save the PDF
    const fileName = `StatusFlow_${employee.name.replace(/\s+/g, '_')}_${report.date}.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Falha ao gerar PDF. Verifique se o navegador suporta a função.')
  }
}
